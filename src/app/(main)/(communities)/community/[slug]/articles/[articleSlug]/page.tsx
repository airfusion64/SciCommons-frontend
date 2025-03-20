'use client';

import { useEffect, useState } from 'react';

import { useParams } from 'next/navigation';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useArticlesApiGetArticle } from '@/api/articles/articles';
import { useArticlesReviewApiListReviews } from '@/api/reviews/reviews';
import DiscussionForum from '@/components/articles/DiscussionForum';
import DisplayArticle, { DisplayArticleSkeleton } from '@/components/articles/DisplayArticle';
import DisplayFAQs from '@/components/articles/DisplayFAQs';
import ReviewCard, { ReviewCardSkeleton } from '@/components/articles/ReviewCard';
import ReviewForm from '@/components/articles/ReviewForm';
import EmptyState from '@/components/common/EmptyState';
import TabNavigation from '@/components/ui/tab-navigation';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

const CommunityArticleDisplayPage: React.FC = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const params = useParams<{ articleSlug: string; slug: string }>();

  const [isRightHovered, setIsRightHovered] = useState(false);

  const { data, error, isPending } = useArticlesApiGetArticle(
    params?.articleSlug || '',
    { community_name: params?.slug || '' },
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  const {
    data: reviewsData,
    error: reviewsError,
    isPending: reviewsIsPending,
    refetch: reviewsRefetch,
  } = useArticlesReviewApiListReviews(
    data?.data.id || 0,
    { community_id: data?.data.community_article?.community.id || 0 },
    {
      query: { enabled: !!accessToken && !!data },
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  useEffect(() => {
    if (reviewsError) {
      showErrorToast(reviewsError);
    }
  }, [reviewsError]);

  const tabs = data
    ? [
        {
          title: 'Reviews',
          content: (
            <div className="flex flex-col gap-2">
              {/* Todo: Uncomment this after testing */}
              {/* {!data.data.is_submitter && (
                <ReviewForm
                  articleId={data?.data.id || 0}
                  refetch={reviewsRefetch}
                  communityId={data?.data.community_article?.community.id}
                />
              )} */}
              <ReviewForm
                articleId={Number(data.data.id)}
                refetch={reviewsRefetch}
                is_submitter={data.data.is_submitter}
                communityId={data?.data.community_article?.community.id}
              />
              {reviewsIsPending && [...Array(5)].map((_, i) => <ReviewCardSkeleton key={i} />)}
              {reviewsData?.data.items.length === 0 && (
                <EmptyState
                  content="No reviews yet"
                  subcontent="Be the first to review this article"
                />
              )}
              {reviewsData?.data.items.map((item) => (
                <ReviewCard key={item.id} review={item} refetch={reviewsRefetch} />
              ))}
            </div>
          ),
        },
        {
          title: 'Discussions',
          content: (
            <DiscussionForum
              articleId={data?.data.id || 0}
              communityId={data?.data.community_article?.community.id}
            />
          ),
        },
        {
          title: 'FAQs',
          content: <DisplayFAQs faqs={data.data.faqs || []} />,
        },
      ]
    : [];

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  return (
    <div className="w-full p-4 py-4 md:px-6">
      {isPending ? <DisplayArticleSkeleton /> : data && <DisplayArticle article={data.data} />}
      {data && (
        <div className="mt-4">
          <TabNavigation tabs={tabs} />
        </div>
      )}
    </div>
  );
};

export default withAuthRedirect(CommunityArticleDisplayPage, { requireAuth: true });
