import { Community, communityState } from "@/atoms/communitiesAtoms";
import { Post } from "@/atoms/postAtoms";
import About from "@/components/Community/About";
import PageContent from "@/components/Layout/PageContent";
import Comments from "@/components/Post/Comments/Comments";
import PostItem from "@/components/Post/PostItem";
import { auth, firestore } from "@/firebase/clientApp";
import useCommunityData from "@/hooks/useCommunityData";
import usePosts from "@/hooks/usePosts";
import { User } from "firebase/auth";
import { doc, getDoc, getDocs } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useSetRecoilState } from "recoil";

const PostPage: React.FC = () => {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const { postStateValue, setPostStateValue, onDeletePost, onVote } =
    usePosts();
  const { communityStateValue } = useCommunityData();
  const setCommunityStateValue = useSetRecoilState(communityState);

  const fetchPost = async (postId: string) => {
    try {
      const postRef = doc(firestore, "posts", postId);
      const postDoc = await getDoc(postRef);

      setPostStateValue((prev) => ({
        ...prev,
        selectedPost: { id: postDoc.id, ...postDoc.data() } as Post,
      }));
    } catch (error) {
      console.log("fetchPost error", error);
    }
  };

  useEffect(() => {
    const { pid } = router.query;
    if (pid && !postStateValue.selectedPost) {
      fetchPost(pid as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-dep
  }, [router.query, postStateValue.selectedPost]); 

  return (
    <PageContent>
      <>
        {postStateValue.selectedPost && (
          <PostItem
            post={postStateValue.selectedPost}
            onVote={onVote}
            onDeletePost={onDeletePost}
            userVoteValue={
              postStateValue.postVotes.find(
                (vote) => vote.postId === postStateValue.selectedPost?.id
              )?.voteValue
            }
            userIsCreator={user?.uid === postStateValue.selectedPost?.creatorId}
          />
        )}
        <Comments
          user={user as User}
          communityId={postStateValue.selectedPost?.communityId as string}
          selectedPost={postStateValue.selectedPost}
        />
      </>
      <>
        {communityStateValue.currentCommunity && (
          <About communityData={communityStateValue.currentCommunity} />
        )}
      </>
    </PageContent>
  );
};
export default PostPage;
