export interface ScheduledPostJobData {
  postId: string;
}

export interface CommentPipelineJobData {
  pipelineId: string;
}

export interface ContentPublishJobData {
  publishJobId: string;
}

export interface TokenRefreshJobData {
  accountId?: string;
}
