import { Post, postState } from "@/atoms/postAtoms";
import { firestore } from "@/firebase/clientApp";
import {
  Box,
  Flex,
  SkeletonCircle,
  SkeletonText,
  Stack,
  Text,
} from "@chakra-ui/react";
import { User } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import CommentInput from "./CommentInput";
import CommentItem, { Comment } from "./CommentItem";

type CommentsProps = {
  user: User;
  selectedPost: Post | null;
  communityId: string;
};

const Comments: React.FC<CommentsProps> = ({
  user,
  selectedPost,
  communityId,
}) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState("");
  const setPostStateValue = useSetRecoilState(postState);

  const onCreateComment = async (commentText: string) => {
    try {
      setCreateLoading(true);
      const batch = writeBatch(firestore);

      //create the comment
      const commentRef = doc(collection(firestore, "comments"));

      const newComment: Comment = {
        id: commentRef.id,
        communityId: communityId,
        creatorDisplayText: user.email!.split("@")[0],
        creatorId: user.uid,
        postId: selectedPost?.id!,
        postTitle: selectedPost?.title!,
        text: commentText,
        createdAt: serverTimestamp() as Timestamp,
      };

      batch.set(commentRef, newComment);

      newComment.createdAt = { seconds: Date.now() / 1000 } as Timestamp;

      const postDocRef = doc(firestore, "posts", selectedPost?.id!);
      batch.update(postDocRef, {
        numberOfComments: increment(1),
      });

      await batch.commit();
      setCommentText("");
      setComments((prev) => [newComment, ...prev]);
      setPostStateValue((prev) => ({
        ...prev,
        selectedPost: {
          ...prev.selectedPost,
          numberOfComments: prev.selectedPost?.numberOfComments! + 1,
        } as Post,
      }));
      setCreateLoading(false);
    } catch (error) {}
  };

  const onDeleteComment = async (comment: Comment) => {
    setDeleteLoadingId(comment.communityId);
    try {
      const batch = writeBatch(firestore);
      const commentRef = doc(firestore, "comments", comment.id);
      batch.delete(commentRef);

      const postRef = doc(firestore, "posts", comment.postId);
      batch.update(postRef, {
        numberOfComments: increment(-1),
      });
      await batch.commit();
      setComments((prev) => prev.filter((item) => item.id !== comment.id));
      setPostStateValue((prev) => ({
        ...prev,
        selectedPost: {
          ...prev.selectedPost,
          numberOfComments: prev.selectedPost?.numberOfComments! - 1,
        } as Post,
      }));
      setDeleteLoadingId("");
    } catch (error: any) {
      console.log("onDeleteComment error", error.message);
    }
  };

  const getPostComments = async () => {
    try {
      const commentQuery = query(
        collection(firestore, "comments"),
        where("postId", "==", selectedPost?.id),
        orderBy("createdAt", "desc")
      );
      const getCommentDoc = await getDocs(commentQuery);

      const getComment = getCommentDoc.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(getComment as Comment[]);
      console.log(getComment);
    } catch (error: any) {
      console.log("getPostComment error", error.message);
    }
    setFetchLoading(false);
  };

  useEffect(() => {
    if (!selectedPost) return;
    getPostComments();
  }, [selectedPost]); // eslint-disable-next-line react-hooks/exhaustive-dep

  return (
    <Box bg="white" borderRadius="0 0 4px 4px" p={2}>
      <Flex
        direction="column"
        pl={10}
        pr={4}
        mb={6}
        fontSize="10pt"
        width="100%"
      >
        {!fetchLoading && (
          <CommentInput
            commentText={commentText}
            setCommentText={setCommentText}
            user={user}
            createLoading={createLoading}
            onCreateComment={onCreateComment}
          />
        )}
      </Flex>
      <Stack spacing={6} padding={2}>
        {fetchLoading ? (
          <>
            {[0, 1, 2].map((item) => (
              <Box key={item} padding={6} bg="white">
                <SkeletonCircle size="10" />
                <SkeletonText mt="4" noOfLines={2} spacing="4" />
              </Box>
            ))}
          </>
        ) : (
          <>
            {comments.length === 0 ? (
              <Flex
                direction="column"
                justify="center"
                align="center"
                borderTop="1px solid"
                borderColor="gray.100"
                p={20}
              >
                <Text fontWeight={700} opacity={0.3}>
                  No Comment Yet
                </Text>
              </Flex>
            ) : (
              <>
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onDeleteComment={onDeleteComment}
                    loadingDelete={deleteLoadingId === comment.id}
                    userId={user.uid}
                  />
                ))}
              </>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
};
export default Comments;
