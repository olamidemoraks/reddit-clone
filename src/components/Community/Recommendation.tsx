import { Community } from "@/atoms/communitiesAtoms";
import { firestore } from "@/firebase/clientApp";
import useCommunityData from "@/hooks/useCommunityData";
import {
  Flex,
  Image,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
  Icon,
  Box,
  Button,
} from "@chakra-ui/react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FaReddit } from "react-icons/fa";

const Recommendation: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const { communityStateValue, onJoinOrLeaveCommunity } = useCommunityData();

  const getCommunityRecommendations = async () => {
    setLoading(true);
    try {
      const communityQuery = query(
        collection(firestore, "communities"),
        orderBy("numberOfMember", "desc"),
        limit(5)
      );
      const communityDoc = await getDocs(communityQuery);
      const community = communityDoc.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCommunities(community as Community[]);
      console.log(communities);
    } catch (error) {}
    setLoading(false);
  };

  useEffect(() => {
    getCommunityRecommendations();
  }, []); // eslint-disable-next-line react-hooks/exhaustive-dep

  return (
    <Flex
      direction="column"
      bg="white"
      borderRadius={4}
      border="1px solid"
      borderColor="gray.300"
    >
      <Flex
        align={"flex-end"}
        color="white"
        padding="6px 10px"
        height="70px"
        borderRadius="4px 4px 0 0"
        fontWeight={700}
        bgImage="url(/images/recCommsArt.png)"
        backgroundSize="cover"
        bgGradient="linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.75)),url(/images/recCommsArt.png)"
      >
        Top Communities
      </Flex>
      <Flex direction={"column"}>
        {loading ? (
          <Stack mt={2} p={3}>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Skeleton height="10px" width="70%" />
            </Flex>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Skeleton height="10px" width="70%" />
            </Flex>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Skeleton height="10px" width="70%" />
            </Flex>
          </Stack>
        ) : (
          <>
            {communities.map((item, idx) => {
              const isJoined = !!communityStateValue.mySnippets.find(
                (snippet) => snippet.communnityId === item.id
              );
              return (
                <Link key={item.id} href={`/r/${item.id}`}>
                  <Flex
                    align="center"
                    fontSize="10pt"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    p="10px 12px"
                    position="relative"
                  >
                    <Flex width="80%" align="center">
                      <Flex width="15%">
                        <Text>{idx + 1}</Text>
                      </Flex>
                      <Flex align="center" width="80%">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            borderRadius="full"
                            boxSize="28px"
                            mr={2}
                            alt=""
                          />
                        ) : (
                          <Icon
                            as={FaReddit}
                            fontSize={30}
                            color="brand.100"
                            mr={2}
                          />
                        )}
                        <span
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            color: "black",
                          }}
                        >
                          {`r/${item.id}`}
                        </span>
                      </Flex>
                    </Flex>
                    <Box position="absolute" right="10px">
                      <Button
                        height="22px"
                        fontSize="8pt"
                        variant={isJoined ? "outline" : "solid"}
                        onClick={(event) => {
                          event.stopPropagation();
                          onJoinOrLeaveCommunity(item, isJoined);
                        }}
                      >
                        {isJoined ? "Joined" : "Join"}
                      </Button>
                    </Box>
                  </Flex>
                </Link>
              );
            })}
            <Box p="10px 20px">
              <Button height="30px" width="100%">
                View All
              </Button>
            </Box>
          </>
        )}
      </Flex>
    </Flex>
  );
};
export default Recommendation;
