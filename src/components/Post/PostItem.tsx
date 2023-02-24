import { Post } from "@/atoms/postAtoms";
import { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { BsChat, BsDot } from "react-icons/bs";
import { FaReddit } from "react-icons/fa";
import {
  IoArrowDownCircleOutline,
  IoArrowUpCircleOutline,
  IoArrowRedoOutline,
  IoArrowUpCircleSharp,
  IoArrowDownCircleSharp,
  IoBookmarkOutline,
} from "react-icons/io5";
import {
  Alert,
  Flex,
  Text,
  Skeleton,
  Icon,
  Stack,
  Image,
  Spinner,
} from "@chakra-ui/react";
import { AlertIcon } from "@chakra-ui/react";
import moment from "moment";
import { useRouter } from "next/router";
import Link from "next/link";

type PostItemProps = {
  post: Post;
  userIsCreator: boolean;
  userVoteValue?: number;
  onVote: (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    post: Post,
    vote: number,
    communityId: string
  ) => void;
  onDeletePost: (post: Post) => Promise<boolean>;
  onSelectPost?: (post: Post) => void;
  homePage?: boolean;
};

const PostItem: React.FC<PostItemProps> = ({
  post,
  userIsCreator,
  userVoteValue,
  onDeletePost,
  onSelectPost,
  onVote,
  homePage,
}) => {
  const [loadingImage, setLoadingImage] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState("");
  const singlePagePost = !onSelectPost;
  const router = useRouter();

  const handleDelete = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
    setLoadingDelete(true);
    try {
      const success = await onDeletePost(post);

      if (!success) {
        throw new Error("Failed to delete post");
      }
      if (singlePagePost) router.back();
      console.log("Post was successfully deleted");
    } catch (error: any) {
      setError(error.message);
    }
    setLoadingDelete(false);
  };
  return (
    <Flex
      bg="white"
      border="1px solid"
      borderColor={singlePagePost ? "white" : "gray.300"}
      borderRadius={singlePagePost ? "4px 4px 0 0" : "4px"}
      _hover={{ borderColor: singlePagePost ? "none" : "gray.500" }}
      cursor={singlePagePost ? "unset" : "pointer"}
      onClick={() => onSelectPost && onSelectPost(post)}
    >
      <Flex
        direction="column"
        align="center"
        bg={singlePagePost ? "none" : "gray.100"}
        p={2}
        width="40px"
        borderRadius={singlePagePost ? "0" : "3px 0 0 3px"}
      >
        <Icon
          as={
            userVoteValue === 1 ? IoArrowUpCircleSharp : IoArrowUpCircleOutline
          }
          color={userVoteValue === 1 ? "brand.100" : "gray.400"}
          fontSize={22}
          onClick={(event) => onVote(event, post, 1, post.communityId)}
          cursor="pointer"
        />
        <Text fontSize="9pt">{post.voteStatus}</Text>
        <Icon
          as={
            userVoteValue === -1
              ? IoArrowDownCircleSharp
              : IoArrowDownCircleOutline
          }
          color={userVoteValue === -1 ? "#4379ff" : "gray.400"}
          fontSize={22}
          onClick={(event) => onVote(event, post, -1, post.communityId)}
          cursor="pointer"
        />
      </Flex>
      <Flex direction="column" width="100%">
        {error && (
          <Alert status="error" bg="red.100">
            <AlertIcon color="red.500" />
            <Text mr={2} color="red.700">
              {error}
            </Text>
          </Alert>
        )}
        <Stack spacing={1} p="10px">
          <Stack direction="row" spacing={0.6} align="center" fontSize="9pt">
            {/* home page check */}
            {homePage && (
              <>
                {post.communityImageUrl ? (
                  <Image
                    src={post.communityImageUrl}
                    borderRadius="full"
                    boxSize="18px"
                    mr={2}
                    alt=""
                  />
                ) : (
                  <Icon as={FaReddit} fontSize="18pt" mr={1} color="blue.500" />
                )}
                <Link href={`/r/${post.communityId}`}>
                  <Text
                    fontWeight={700}
                    _hover={{ textDecoration: "underline" }}
                    onClick={(event) => event.stopPropagation()}
                  >{`r/${post.communityId}`}</Text>
                </Link>
                <Icon as={BsDot} color="gray.500" fontSize={8} />
              </>
            )}
            <Text>
              Posted by u/{post.creatorDisplayName}{" "}
              {moment(new Date(post.createdAt?.seconds * 1000)).fromNow()}
            </Text>
          </Stack>
          <Text fontSize="12pt" fontWeight={600}>
            {post.title}
          </Text>
          <Text>{post.body}</Text>
          {post.imageUrl && (
            <Flex align="center" justify="center" p={2}>
              {loadingImage && (
                <Skeleton height="200px" width="100%" borderRadius={4} />
              )}
              <Image
                src={post.imageUrl}
                maxHeight="460px"
                alt="Post Image"
                display={loadingImage ? "hidden" : "unset"}
                onLoad={() => setLoadingImage(false)}
              />
            </Flex>
          )}
        </Stack>
        <Flex>
          <Flex ml={1} mb={0.5} color="gray.500">
            <Flex
              align="center"
              p="8px 10px"
              borderRadius={4}
              _hover={{ bg: "gray.200" }}
              cursor="pointer"
            >
              <Icon as={BsChat} mr={2} />
              <Text fontSize="9pt">{post.numberOfComments}</Text>
            </Flex>
          </Flex>
          <Flex ml={1} mb={0.5} color="gray.500">
            <Flex
              align="center"
              p="8px 10px"
              borderRadius={4}
              _hover={{ bg: "gray.200" }}
              cursor="pointer"
            >
              <Icon as={IoArrowRedoOutline} mr={2} />
              <Text fontSize="9pt">Save</Text>
            </Flex>
          </Flex>
          <Flex ml={1} mb={0.5} color="gray.500">
            <Flex
              align="center"
              p="8px 10px"
              borderRadius={4}
              _hover={{ bg: "gray.200" }}
              cursor="pointer"
            >
              <Icon as={IoBookmarkOutline} mr={2} />
              <Text fontSize="9pt">Share</Text>
            </Flex>
          </Flex>
          {userIsCreator && (
            <Flex ml={1} mb={0.5} color="gray.500">
              <Flex
                align="center"
                p="8px 10px"
                borderRadius={4}
                _hover={{ bg: "gray.200" }}
                cursor="pointer"
                onClick={handleDelete}
              >
                {loadingDelete ? (
                  <>
                    <Spinner size="sm" />
                  </>
                ) : (
                  <>
                    <Icon as={AiOutlineDelete} mr={2} />
                    <Text fontSize="9pt">Delete</Text>
                  </>
                )}
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
export default PostItem;
