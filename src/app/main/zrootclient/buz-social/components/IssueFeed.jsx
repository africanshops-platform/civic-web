import { memo } from 'react';
import IssueCard from './IssueCard';
import { CivicLoadingSkeleton, CivicEmptyState } from '../../civic-shared';

function IssueFeed({ issues = [], isLoading, isError, onUpvote }) {
  if (isLoading) return <CivicLoadingSkeleton />;

  if (isError) {
    return (
      <CivicEmptyState
        title="Could not load issues"
        description="There was a problem loading community issues. Please try again."
      />
    );
  }

  if (!issues.length) {
    return (
      <CivicEmptyState
        title="No issues found"
        description="No community issues match your current filters. Try broadening your search."
      />
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {issues.map((issue, index) => (
        <IssueCard key={issue.id} issue={issue} index={index} onUpvote={onUpvote} />
      ))}
    </div>
  );
}

export default memo(IssueFeed);
