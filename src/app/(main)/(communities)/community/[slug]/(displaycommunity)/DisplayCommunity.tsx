'use client';

import React, { useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Check, FileText, UserCheck, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';

import '@/api/communities/communities';
import { useCommunitiesApiJoinJoinCommunity } from '@/api/join-community/join-community';
import { CommunityOut } from '@/api/schemas';
import { BlockSkeleton, Skeleton, TextSkeleton } from '@/components/common/Skeleton';
import TruncateText from '@/components/common/TruncateText';
import { Button, ButtonIcon, ButtonTitle } from '@/components/ui/button';
import useIdenticon from '@/hooks/useIdenticons';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

import ArticleSubmission from './ArticleSubmission';

interface DisplayCommunityProps {
  community: CommunityOut;
  refetch: () => void;
}

const DisplayCommunity: React.FC<DisplayCommunityProps> = ({ community, refetch }) => {
  const params = useParams<{ slug: string }>();
  const imageData = useIdenticon(60);
  const accessToken = useAuthStore((state) => state.accessToken);
  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };

  const {
    mutate,
    data,
    isSuccess: isJoinSuccess,
    error,
    isPending,
  } = useCommunitiesApiJoinJoinCommunity({
    request: axiosConfig,
  });

  const handleJoin = () => {
    mutate({ communityId: community.id });
  };

  useEffect(() => {
    if (isJoinSuccess) {
      toast.success(`${data.data.message}`);
      refetch();
    }
    if (error) {
      showErrorToast(error);
    }
  }, [isJoinSuccess, error, data, refetch]);

  return (
    <div className="overflow-hidden rounded-xl border border-common-contrast bg-common-cardBackground">
      <div className="relative p-4">
        <div className="flex gap-4">
          <div className="relative aspect-square size-10 shrink-0 overflow-hidden rounded-full">
            <Image
              src={community.profile_pic_url || `data:image/png;base64,${imageData}`}
              alt="Profile"
              layout="fill"
              objectFit="cover"
            />
          </div>
          <div className="flex w-full flex-col gap-2">
            <h2
              className="w-[95%] text-wrap font-bold text-text-primary res-heading-sm"
              style={{
                wordBreak: 'break-word',
              }}
            >
              {community.name}
            </h2>
            <div
              className="w-[95%] res-text-sm"
              style={{
                wordBreak: 'break-word',
              }}
            >
              <TruncateText
                text={community.description}
                maxLines={2}
                textClassName="text-text-secondary"
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-text-secondary">
              <div className="flex items-center">
                <Users className="mr-1 h-4 w-4" />
                <span className="text-xs">{community.num_members} Members</span>
              </div>
              <div className="flex items-center">
                <FileText className="mr-1 h-4 w-4" />
                <span className="text-xs">{community.num_published_articles} Articles</span>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="absolute right-4 top-4">
          <Button className="bg-functional-yellowLight/10 hover:bg-functional-yellowLight/5">
            <ButtonIcon>
              <Bell className="h-4 w-4 text-functional-yellow" />
            </ButtonIcon>
            <ButtonTitle className="text-functional-yellow">Notifications</ButtonTitle>
          </Button>
        </div> */}
      </div>
      <div className="flex items-center justify-between px-2">
        <div className="ml-auto flex items-center justify-end space-x-4 p-4">
          {community.is_admin && (
            <>
              <ArticleSubmission communityName={community.name} />
              <Link href={`/community/${params?.slug}/settings`}>
                <Button className="bg-black hover:bg-black">
                  <ButtonTitle className="text-white">Settings</ButtonTitle>
                </Button>
              </Link>
            </>
          )}
          {!community.is_admin && community.is_member && (
            <>
              <ArticleSubmission communityName={community.name} />
              <Button className="cursor-default bg-transparent ring-1 ring-common-contrast hover:bg-transparent">
                <ButtonIcon>
                  <UserCheck className="size-4 text-text-secondary" />
                </ButtonIcon>
                <ButtonTitle className="text-text-secondary">Joined</ButtonTitle>
              </Button>
            </>
          )}
          {!community.is_admin &&
            !community.is_member &&
            community.join_request_status === 'pending' && (
              <Button className="cursor-default bg-transparent ring-1 ring-common-contrast hover:bg-transparent">
                <ButtonIcon>
                  <Check className="size-4 text-text-secondary" />
                </ButtonIcon>
                <ButtonTitle className="text-text-secondary">Requested</ButtonTitle>
              </Button>
            )}
          {!community.is_admin &&
            !community.is_member &&
            community.join_request_status !== 'pending' && (
              <Button
                className="bg-transparent ring-1 ring-common-contrast hover:bg-common-minimal"
                onClick={() => handleJoin()}
                loading={isPending}
                showLoadingSpinner={true}
              >
                <ButtonIcon>
                  <UserPlus className="size-4 text-text-secondary" />
                </ButtonIcon>
                <ButtonTitle className="text-text-secondary">Join</ButtonTitle>
              </Button>
            )}
        </div>
      </div>
    </div>
  );
};

export default DisplayCommunity;

export const DisplayCommunitySkeleton: React.FC = () => {
  return (
    <>
      <Skeleton className="relative flex rounded-xl border border-common-contrast bg-common-cardBackground">
        <BlockSkeleton className="aspect-square size-10 rounded-full" />
        <BlockSkeleton className="absolute right-4 top-4 h-8 w-28" />
        <div className="ml-4 flex-1">
          <TextSkeleton className="w-20" />
          <TextSkeleton className="mt-2 w-32" />
          <BlockSkeleton className="mt-2" />
          <div className="mt-2 flex w-full justify-end gap-4">
            <TextSkeleton className="h-8 w-32" />
            <TextSkeleton className="h-8 w-32" />
          </div>
          <BlockSkeleton className="mt-2 h-14" />
        </div>
      </Skeleton>
      <Skeleton className="border-none bg-transparent">
        <div className="mt-4 flex gap-6 border-b border-common-minimal p-4">
          <BlockSkeleton className="h-8 w-32" />
          <BlockSkeleton className="h-8 w-32" />
          <BlockSkeleton className="h-8 w-32" />
        </div>
      </Skeleton>
      <Skeleton className="relative flex rounded-xl border border-common-contrast bg-common-cardBackground">
        <BlockSkeleton className="aspect-square size-10 rounded-full" />
        <div className="ml-4 flex-1">
          <TextSkeleton className="w-20" />
          <TextSkeleton className="mt-2 w-32" />
          <BlockSkeleton className="mt-2" />
        </div>
      </Skeleton>
    </>
  );
};
