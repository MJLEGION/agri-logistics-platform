-- ============================================================================
-- AGRI-LOGISTICS PLATFORM - COMMUNITY RATINGS & REVIEWS DATABASE MIGRATION
-- ============================================================================
-- This migration script creates all necessary tables for the ratings system
-- Run this on your PostgreSQL database to set up the ratings infrastructure
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- ============================================================================
-- 1. RATINGS TABLE
-- ============================================================================

DROP TABLE IF EXISTS ratings CASCADE;

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL,
  transporter_id UUID NOT NULL,
  farmer_id UUID NOT NULL,
  transporter_name VARCHAR(255),
  farmer_name VARCHAR(255) NOT NULL,
  
  -- Rating data
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  comment_length INT DEFAULT 0,
  
  -- Analysis
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  is_verified_rating BOOLEAN DEFAULT FALSE,
  
  -- Interactions
  helpful_count INT DEFAULT 0,
  unhelpful_count INT DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  UNIQUE(transaction_id) -- One rating per transaction
);

-- Indexes for ratings table
CREATE INDEX idx_ratings_transporter ON ratings(transporter_id);
CREATE INDEX idx_ratings_farmer ON ratings(farmer_id);
CREATE INDEX idx_ratings_created_at ON ratings(created_at DESC);
CREATE INDEX idx_ratings_sentiment ON ratings(sentiment);
CREATE INDEX idx_ratings_rating_distribution ON ratings(transporter_id, rating);

-- ============================================================================
-- 2. REVIEWS TABLE
-- ============================================================================

DROP TABLE IF EXISTS reviews CASCADE;

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating_id UUID NOT NULL,
  transporter_id UUID NOT NULL,
  farmer_id UUID NOT NULL,
  farmer_name VARCHAR(255) NOT NULL,
  
  -- Content
  review_text TEXT NOT NULL,
  review_length INT DEFAULT 0,
  
  -- Analysis
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  is_helpful_vote_enabled BOOLEAN DEFAULT TRUE,
  
  -- Moderation
  is_approved BOOLEAN DEFAULT FALSE,
  approval_date TIMESTAMP,
  approved_by UUID,
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason VARCHAR(255),
  flag_category VARCHAR(50) CHECK (flag_category IN ('spam', 'profanity', 'inappropriate', 'fake', 'harassment', 'external')),
  flagged_by UUID,
  flagged_at TIMESTAMP,
  
  -- Interactions
  helpful_count INT DEFAULT 0,
  unhelpful_count INT DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  FOREIGN KEY (rating_id) REFERENCES ratings(id) ON DELETE CASCADE,
  FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (flagged_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for reviews table
CREATE INDEX idx_reviews_transporter ON reviews(transporter_id);
CREATE INDEX idx_reviews_farmer ON reviews(farmer_id);
CREATE INDEX idx_reviews_rating ON reviews(rating_id);
CREATE INDEX idx_reviews_is_approved ON reviews(is_approved);
CREATE INDEX idx_reviews_is_flagged ON reviews(is_flagged);
CREATE INDEX idx_reviews_sentiment ON reviews(sentiment);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_helpful ON reviews(helpful_count DESC);
CREATE INDEX idx_reviews_text_search ON reviews USING gin(to_tsvector('english', review_text));

-- ============================================================================
-- 3. TRANSPORTER STATS TABLE
-- ============================================================================

DROP TABLE IF EXISTS transporter_stats CASCADE;

CREATE TABLE transporter_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transporter_id UUID NOT NULL UNIQUE,
  
  -- Rating statistics
  average_rating DECIMAL(3, 2) DEFAULT 0.0 CHECK (average_rating >= 0 AND average_rating <= 5),
  total_ratings INT DEFAULT 0,
  rating_distribution_5 INT DEFAULT 0,
  rating_distribution_4 INT DEFAULT 0,
  rating_distribution_3 INT DEFAULT 0,
  rating_distribution_2 INT DEFAULT 0,
  rating_distribution_1 INT DEFAULT 0,
  
  -- Performance metrics
  on_time_percentage DECIMAL(5, 2) DEFAULT 0.0 CHECK (on_time_percentage >= 0 AND on_time_percentage <= 100),
  completion_percentage DECIMAL(5, 2) DEFAULT 0.0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  total_deliveries INT DEFAULT 0,
  successful_deliveries INT DEFAULT 0,
  on_time_deliveries INT DEFAULT 0,
  
  -- Verification badge
  is_verified BOOLEAN DEFAULT FALSE,
  verified_badge_type VARCHAR(20) CHECK (verified_badge_type IN ('gold', 'silver', 'bronze') OR verified_badge_type IS NULL),
  verified_date TIMESTAMP,
  verified_by UUID,
  
  -- Reputation
  reputation_score INT DEFAULT 0,
  review_count INT DEFAULT 0,
  
  -- Metadata
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  FOREIGN KEY (transporter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for transporter stats
CREATE INDEX idx_transporter_stats_average_rating ON transporter_stats(average_rating DESC);
CREATE INDEX idx_transporter_stats_is_verified ON transporter_stats(is_verified);
CREATE INDEX idx_transporter_stats_badge_type ON transporter_stats(verified_badge_type);
CREATE INDEX idx_transporter_stats_reputation ON transporter_stats(reputation_score DESC);
CREATE INDEX idx_transporter_stats_total_deliveries ON transporter_stats(total_deliveries DESC);

-- ============================================================================
-- 4. VERIFICATION HISTORY TABLE
-- ============================================================================

DROP TABLE IF EXISTS verification_history CASCADE;

CREATE TABLE verification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transporter_id UUID NOT NULL,
  
  -- Verification details
  badge_type VARCHAR(20),
  action VARCHAR(20) NOT NULL CHECK (action IN ('granted', 'revoked', 'downgraded', 'upgraded')),
  reason VARCHAR(500),
  
  -- Audit
  verified_by UUID,
  is_auto_verification BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  FOREIGN KEY (transporter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for verification history
CREATE INDEX idx_verification_history_transporter ON verification_history(transporter_id);
CREATE INDEX idx_verification_history_action ON verification_history(action);
CREATE INDEX idx_verification_history_created_at ON verification_history(created_at DESC);
CREATE INDEX idx_verification_history_badge_type ON verification_history(badge_type);

-- ============================================================================
-- 5. FLAGGED REVIEWS TABLE
-- ============================================================================

DROP TABLE IF EXISTS flagged_reviews CASCADE;

CREATE TABLE flagged_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL,
  
  -- Flag details
  flagged_by UUID NOT NULL,
  flag_reason VARCHAR(500) NOT NULL,
  flag_category VARCHAR(50) CHECK (flag_category IN ('spam', 'profanity', 'inappropriate', 'fake', 'harassment', 'external')),
  
  -- Moderation
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'dismissed')),
  reviewed_by UUID,
  review_date TIMESTAMP,
  review_notes TEXT,
  action_taken VARCHAR(50) CHECK (action_taken IN ('deleted', 'hidden', 'approved', 'archived')),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  FOREIGN KEY (flagged_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for flagged reviews
CREATE INDEX idx_flagged_reviews_review ON flagged_reviews(review_id);
CREATE INDEX idx_flagged_reviews_status ON flagged_reviews(status);
CREATE INDEX idx_flagged_reviews_category ON flagged_reviews(flag_category);
CREATE INDEX idx_flagged_reviews_created_at ON flagged_reviews(created_at DESC);

-- ============================================================================
-- 6. RATING REMINDERS TABLE
-- ============================================================================

DROP TABLE IF EXISTS rating_reminders CASCADE;

CREATE TABLE rating_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL,
  farmer_id UUID NOT NULL,
  transporter_id UUID NOT NULL,
  
  -- Reminder tracking
  reminder_count INT DEFAULT 0,
  last_reminder_sent TIMESTAMP,
  next_reminder_date TIMESTAMP,
  
  -- Status
  is_rated BOOLEAN DEFAULT FALSE,
  rated_at TIMESTAMP,
  rating_id UUID,
  
  -- Configuration
  reminder_enabled BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  UNIQUE(transaction_id),
  FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (transporter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (rating_id) REFERENCES ratings(id) ON DELETE SET NULL
);

-- Indexes for rating reminders
CREATE INDEX idx_rating_reminders_farmer ON rating_reminders(farmer_id);
CREATE INDEX idx_rating_reminders_is_rated ON rating_reminders(is_rated);
CREATE INDEX idx_rating_reminders_next_reminder ON rating_reminders(next_reminder_date);
CREATE INDEX idx_rating_reminders_created_at ON rating_reminders(created_at DESC);

-- ============================================================================
-- 7. HELPFUL VOTES TABLE (for tracking user votes)
-- ============================================================================

DROP TABLE IF EXISTS helpful_votes CASCADE;

CREATE TABLE helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL,
  user_id UUID NOT NULL,
  
  -- Vote
  is_helpful BOOLEAN NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  UNIQUE(review_id, user_id), -- One vote per user per review
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for helpful votes
CREATE INDEX idx_helpful_votes_review ON helpful_votes(review_id);
CREATE INDEX idx_helpful_votes_user ON helpful_votes(user_id);
CREATE INDEX idx_helpful_votes_is_helpful ON helpful_votes(is_helpful);

-- ============================================================================
-- 8. RATING INCENTIVES TABLE (for advanced features)
-- ============================================================================

DROP TABLE IF EXISTS rating_incentives CASCADE;

CREATE TABLE rating_incentives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL,
  transporter_id UUID NOT NULL,
  
  -- Incentive details
  incentive_type VARCHAR(50), -- 'bonus_discount', 'loyalty_points', 'cashback'
  incentive_amount DECIMAL(10, 2),
  incentive_description VARCHAR(255),
  
  -- Status
  is_awarded BOOLEAN DEFAULT FALSE,
  awarded_at TIMESTAMP,
  is_redeemed BOOLEAN DEFAULT FALSE,
  redeemed_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  
  -- Constraints
  FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (transporter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for incentives
CREATE INDEX idx_incentives_farmer ON rating_incentives(farmer_id);
CREATE INDEX idx_incentives_is_awarded ON rating_incentives(is_awarded);
CREATE INDEX idx_incentives_is_redeemed ON rating_incentives(is_redeemed);

-- ============================================================================
-- 9. LEADERBOARD TABLE (cached)
-- ============================================================================

DROP TABLE IF EXISTS leaderboard_cache CASCADE;

CREATE TABLE leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transporter_id UUID NOT NULL UNIQUE,
  
  -- Ranking
  rank INT,
  period VARCHAR(20), -- 'weekly', 'monthly', 'all_time'
  
  -- Score
  leaderboard_score DECIMAL(10, 2),
  
  -- Display data
  average_rating DECIMAL(3, 2),
  total_ratings INT,
  verified_badge_type VARCHAR(20),
  
  -- Metadata
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  FOREIGN KEY (transporter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for leaderboard
CREATE INDEX idx_leaderboard_rank ON leaderboard_cache(rank);
CREATE INDEX idx_leaderboard_period ON leaderboard_cache(period);
CREATE INDEX idx_leaderboard_score ON leaderboard_cache(leaderboard_score DESC);

-- ============================================================================
-- 10. AUDIT LOG TABLE
-- ============================================================================

DROP TABLE IF EXISTS ratings_audit_log CASCADE;

CREATE TABLE ratings_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50), -- 'rating', 'review', 'verification'
  entity_id UUID,
  user_id UUID,
  changes JSONB, -- Store what changed
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for audit log
CREATE INDEX idx_audit_log_action ON ratings_audit_log(action);
CREATE INDEX idx_audit_log_entity ON ratings_audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_user ON ratings_audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON ratings_audit_log(created_at DESC);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rating_reminders_updated_at BEFORE UPDATE ON rating_reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update comment length on insert/update
CREATE OR REPLACE FUNCTION update_comment_length()
RETURNS TRIGGER AS $$
BEGIN
  NEW.comment_length = COALESCE(LENGTH(NEW.comment), 0);
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comment_length_trigger BEFORE INSERT OR UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_comment_length();

-- Function to update review length
CREATE OR REPLACE FUNCTION update_review_length()
RETURNS TRIGGER AS $$
BEGIN
  NEW.review_length = COALESCE(LENGTH(NEW.review_text), 0);
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_review_length_trigger BEFORE INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_review_length();

-- Function to automatically update transporter stats when rating is created
CREATE OR REPLACE FUNCTION update_transporter_stats_on_rating()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO transporter_stats (transporter_id)
  VALUES (NEW.transporter_id)
  ON CONFLICT (transporter_id) DO UPDATE SET
    total_ratings = (
      SELECT COUNT(*) FROM ratings WHERE transporter_id = NEW.transporter_id
    ),
    average_rating = (
      SELECT AVG(rating)::DECIMAL(3,2) FROM ratings WHERE transporter_id = NEW.transporter_id
    ),
    rating_distribution_5 = (
      SELECT COUNT(*) FROM ratings WHERE transporter_id = NEW.transporter_id AND rating = 5
    ),
    rating_distribution_4 = (
      SELECT COUNT(*) FROM ratings WHERE transporter_id = NEW.transporter_id AND rating = 4
    ),
    rating_distribution_3 = (
      SELECT COUNT(*) FROM ratings WHERE transporter_id = NEW.transporter_id AND rating = 3
    ),
    rating_distribution_2 = (
      SELECT COUNT(*) FROM ratings WHERE transporter_id = NEW.transporter_id AND rating = 2
    ),
    rating_distribution_1 = (
      SELECT COUNT(*) FROM ratings WHERE transporter_id = NEW.transporter_id AND rating = 1
    ),
    last_updated = CURRENT_TIMESTAMP;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stats_on_rating_insert AFTER INSERT ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_transporter_stats_on_rating();

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment to seed test data:

/*
INSERT INTO ratings (transaction_id, transporter_id, farmer_id, transporter_name, farmer_name, rating, comment, sentiment)
VALUES
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001', 'John Doe', 'Jane Smith', 5, 'Excellent service!', 'positive'),
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174002', 'John Doe', 'Bob Wilson', 4, 'Good service, slightly late', 'positive'),
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174003', 'John Doe', 'Alice Brown', 3, 'Average experience', 'neutral');
*/

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Top rated transporters
CREATE OR REPLACE VIEW top_rated_transporters AS
SELECT 
  ts.transporter_id,
  ts.average_rating,
  ts.total_ratings,
  ts.verified_badge_type,
  ts.on_time_percentage,
  ts.completion_percentage
FROM transporter_stats ts
WHERE ts.total_ratings >= 10
ORDER BY ts.average_rating DESC, ts.total_ratings DESC
LIMIT 100;

-- Pending moderation queue
CREATE OR REPLACE VIEW moderation_queue AS
SELECT 
  r.id,
  r.transporter_id,
  r.farmer_name,
  r.review_text,
  r.created_at,
  (SELECT COUNT(*) FROM flagged_reviews WHERE review_id = r.id AND status = 'pending') as flag_count
FROM reviews r
WHERE r.is_approved = FALSE OR EXISTS (
  SELECT 1 FROM flagged_reviews fr WHERE fr.review_id = r.id AND fr.status = 'pending'
)
ORDER BY r.created_at DESC;

-- Transporter reputation summary
CREATE OR REPLACE VIEW transporter_reputation_summary AS
SELECT 
  ts.transporter_id,
  ts.average_rating,
  ts.total_ratings,
  ts.on_time_percentage,
  ts.completion_percentage,
  ts.verified_badge_type,
  (SELECT COUNT(*) FROM reviews WHERE transporter_id = ts.transporter_id AND is_approved = true) as approved_reviews,
  (SELECT COUNT(*) FROM reviews WHERE transporter_id = ts.transporter_id AND is_flagged = true AND is_approved = false) as flagged_reviews
FROM transporter_stats ts;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables created
SELECT 
  table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%rating%' OR table_name LIKE '%review%' OR table_name LIKE '%verification%'
ORDER BY table_name;