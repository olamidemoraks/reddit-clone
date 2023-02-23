import React from "react";
import { Button, Flex, Icon, Stack, Text } from "@chakra-ui/react";
import { FaReddit } from "react-icons/fa";
import { useSetRecoilState } from "recoil";
import useDirectory from "@/hooks/useDirectory";
import { communityState } from "@/atoms/communitiesAtoms";

const PersonalHome: React.FC = () => {
  const { toggleMenuOpen } = useDirectory();
  const setCommunityModal = useSetRecoilState(communityState);

  const onClick = () => {
    const element = document.getElementById("createPost");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    toggleMenuOpen();
  };
  return (
    <Flex
      direction="column"
      bg="white"
      borderRadius={4}
      cursor="pointer"
      border="1px solid"
      borderColor="gray.300"
      position="sticky"
    >
      <Flex
        align="flex-end"
        color="white"
        p="6px 10px"
        bg="blue.500"
        height="34px"
        borderRadius="4px 4px 0px 0px"
        fontWeight={600}
        bgImage="url(/images/redditPersonalHome.png)"
        backgroundSize="cover"
      ></Flex>
      <Flex direction="column" p="12px">
        <Flex align="center" mb={2}>
          <Icon as={FaReddit} fontSize={50} color="brand.100" mr={2} />
          <Text fontWeight={600}>Home</Text>
        </Flex>
        <Stack spacing={3}>
          <Text fontSize="9pt">
            Your personal Reddit frontpage, built for you.
          </Text>
          <Button height="30px" onClick={onClick}>
            Create Post
          </Button>
          <Button
            variant="outline"
            height="30px"
            onClick={() =>
              setCommunityModal((prev) => ({ ...prev, modal: true }))
            }
          >
            Create Community
          </Button>
        </Stack>
      </Flex>
    </Flex>
  );
};
export default PersonalHome;
