import { Post, postState, PostVote } from "@/atoms/postAtoms";
import { auth, firestore, storage } from "@/firebase/clientApp";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { useEffect } from "react";
import { communityState } from "@/atoms/communitiesAtoms";
import { authModalState } from "@/atoms/authModalAtoms";
import { useRouter } from "next/router";

const usePosts = () => {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [postStateValue, setPostStateValue] = useRecoilState(postState);
  const setAuthModalState = useSetRecoilState(authModalState);
  const currentCommunity = useRecoilValue(communityState).currentCommunity;

  const onVote = async (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    post: Post,
    vote: number,
    communityId: string
  ) => {
    event.stopPropagation();
    if (!user?.uid) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }
    try {
      const { voteStatus } = post;
      const existingVote = postStateValue.postVotes.find(
        (vote) => vote.postId === post.id
      );

      const batch = writeBatch(firestore);
      const updatePost = { ...post };
      const updatePosts = [...postStateValue.posts];
      let updatePostVotes = [...postStateValue.postVotes];
      let voteChange = vote;

      if (!existingVote) {
        const postVoteRef = doc(
          collection(firestore, "users", `${user?.uid}/postVotes`)
        );

        const newVote: PostVote = {
          id: postVoteRef.id,
          communityId: communityId,
          postId: post.id!,
          voteValue: vote,
        };
        batch.set(postVoteRef, newVote);
        updatePost.voteStatus = voteStatus + vote;

        updatePostVotes = [...updatePostVotes, newVote];
      } else {
        const postVoteRef = doc(
          firestore,
          `users/${user?.uid}/postVotes/${existingVote.id}`
        );

        //Removing their vote (up=>neutral) or (down=>neutral)
        if (existingVote.voteValue === vote) {
          //add/subtract 1 to/from post.statusVote
          updatePost.voteStatus = voteStatus - vote;
          updatePostVotes = updatePostVotes.filter(
            (vote) => vote.id !== existingVote.id
          );

          batch.delete(postVoteRef);
          voteChange *= -1;
        }
        //Flipping my vote (up=>down or down=>up)
        else {
          updatePost.voteStatus = voteStatus + 2 * vote;

          const voteIdx = postStateValue.postVotes.findIndex(
            (vote) => vote.id === existingVote.id
          );

          updatePostVotes[voteIdx] = {
            ...existingVote,
            voteValue: vote,
          };

          batch.update(postVoteRef, {
            voteValue: vote,
          });
          voteChange = 2 * vote;
        }
      }

      const postIdx = postStateValue.posts.findIndex(
        (item) => item.id === post.id
      );
      updatePosts[postIdx] = updatePost;

      setPostStateValue((prev) => ({
        ...prev,
        posts: updatePosts,
        postVotes: updatePostVotes,
      }));
      if (postStateValue.selectedPost) {
        setPostStateValue((prev) => ({
          ...prev,
          selectedPost: updatePost,
        }));
      }

      const postRef = doc(firestore, "posts", post.id!);
      batch.update(postRef, {
        voteStatus: voteStatus + voteChange,
      });

      await batch.commit();
    } catch (error) {
      console.log("onVote error", error);
    }
  };

  const onSelectPost = (post: Post) => {
    setPostStateValue((prev) => ({
      ...prev,
      selectedPost: post,
    }));

    router.push(`/r/${post.communityId}/comment/${post.id}`);
  };

  const onDeletePost = async (post: Post): Promise<boolean> => {
    try {
      if (post.imageUrl) {
        const imageRef = ref(storage, `posts/${post.id}/image`);
        await deleteObject(imageRef);
      }

      const postRef = doc(firestore, "posts", post.id!);
      await deleteDoc(postRef);

      setPostStateValue((prev) => ({
        ...prev,
        posts: prev.posts.filter((item) => item.id !== post.id),
      }));
      return true;
    } catch (error) {
      return false;
    }
  };

  const getCommunityPostVotes = async (communityId: string) => {
    const postVotesQuery = query(
      collection(firestore, `users/${user?.uid}/postVotes`),
      where("communityId", "==", communityId)
    );
    const postVotesDoc = await getDocs(postVotesQuery);
    const postVote = postVotesDoc.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));
    setPostStateValue((prev) => ({
      ...prev,
      postVotes: postVote as PostVote[],
    }));
  };
  useEffect(() => {
    if (!currentCommunity?.id || !user) return;

    getCommunityPostVotes(currentCommunity.id);
  }, [currentCommunity, user]);

  useEffect(() => {
    if (!user) {
      setPostStateValue((prev) => ({
        ...prev,
        postVotes: [],
      }));
    }
  }, [user]);
  return {
    postStateValue,
    setPostStateValue,
    onDeletePost,
    onSelectPost,
    onVote,
  };
};
export default usePosts;
