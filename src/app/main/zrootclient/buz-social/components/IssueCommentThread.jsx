import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, Button, TextField, CircularProgress, Chip } from '@mui/material';
import { ThumbUp, Send, VerifiedUser } from '@mui/icons-material';

const F = {
  body: 'clamp(1.3rem, 2vw,   1.64rem)',
  meta: 'clamp(1.2rem, 1.8vw, 1.5rem)',
  btn:  'clamp(1.3rem, 2vw,   1.56rem)',
  subH: 'clamp(1.4rem, 2.2vw, 1.8rem)',
};

function CommentItem({ comment, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      style={{
        display: 'flex', gap: 'clamp(10px, 1.4vw, 14px)',
        padding: 'clamp(12px, 1.8vw, 16px)',
        borderRadius: 14,
        background: comment.isOfficial ? 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)' : '#f9fafb',
        border: `1px solid ${comment.isOfficial ? '#c7d2fe' : '#e5e7eb'}`,
      }}
    >
      <Avatar sx={{ width: 'clamp(32px, 4vw, 40px)', height: 'clamp(32px, 4vw, 40px)', bgcolor: comment.isOfficial ? '#1d4ed8' : '#6b7280', fontSize: F.meta, flexShrink: 0 }}>
        {comment.author.name.charAt(0)}
      </Avatar>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800, color: '#111827', fontSize: F.body }}>{comment.author.name}</span>
          {comment.isOfficial && (
            <Chip
              icon={<VerifiedUser sx={{ fontSize: 'clamp(10px, 1.4vw, 14px)' }} />}
              label="Official Response"
              size="small"
              sx={{ background: '#1d4ed8', color: 'white', fontWeight: 700, fontSize: F.meta, height: 22 }}
            />
          )}
          <span style={{ fontSize: F.meta, color: '#9ca3af', marginLeft: 'auto' }}>
            {new Date(comment.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <p style={{ margin: '0 0 8px', color: '#374151', fontSize: F.body, lineHeight: 1.75 }}>{comment.body}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: F.meta }}>
            <ThumbUp sx={{ fontSize: 'clamp(12px, 1.6vw, 16px)' }} />{comment.upvotes}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function IssueCommentThread({ comments = [], onPostComment, isPosting }) {
  const [body, setBody] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!body.trim()) return;
    onPostComment?.(body.trim());
    setBody('');
  }

  return (
    <div>
      <div style={{ fontWeight: 800, color: '#111827', marginBottom: 14, fontSize: F.subH }}>
        {comments.length} Comment{comments.length !== 1 ? 's' : ''}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        <AnimatePresence>
          {comments.map((c, i) => <CommentItem key={c.id} comment={c} index={i} />)}
        </AnimatePresence>
        {comments.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'clamp(18px, 3vw, 28px)', color: '#9ca3af', fontSize: F.body }}>
            No comments yet. Be the first to respond.
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={4}
          placeholder="Add your comment or update..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          size="small"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', fontSize: F.body } }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!body.trim() || isPosting}
          sx={{ background: '#1d4ed8', color: 'white', borderRadius: '12px', minWidth: 'clamp(42px, 5vw, 52px)', height: 'clamp(42px, 5vw, 52px)', p: 0, flexShrink: 0, '&:hover': { filter: 'brightness(0.92)' } }}
        >
          {isPosting ? <CircularProgress size={18} color="inherit" /> : <Send sx={{ fontSize: 'clamp(16px, 2vw, 20px)' }} />}
        </Button>
      </form>
    </div>
  );
}

export default memo(IssueCommentThread);
