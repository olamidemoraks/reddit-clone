import CreateCommunityModal from "@/components/Modal/CreateCommunity/CreateCommunityModal";
import { useState } from "react";
import { MenuItem, Flex, Icon, Text, Box } from "@chakra-ui/react";
import { GrAdd } from "react-icons/gr";
import { useRecoilState, useRecoilValue } from "recoil";
import { communityState } from "@/atoms/communitiesAtoms";
import MenuListItem from "./MenuListItem";
import { FaReddit } from "react-icons/fa";

type CommunitiesProps = {};

const Communities: React.FC<CommunitiesProps> = () => {
  const [communityStateModal, setCommunityStateModal] =
    useRecoilState(communityState);
  const [open, setOpen] = useState(false);
  const mySnippet = useRecoilValue(communityState).mySnippets;
  return (
    <>
      <CreateCommunityModal
        open={communityStateModal.modal}
        handleClose={() =>
          setCommunityStateModal((prev) => ({ ...prev, modal: false }))
        }
      />
      <Box pl={3} mb={4}>
        <Text pl={3} mb={1} fontSize="7pt" fontWeight={500} color="gray.500">
          MODERATING
        </Text>

        {mySnippet
          .filter((c) => c.isModerator === true)
          .map((snippet) => (
            <MenuListItem
              key={snippet.communnityId}
              icon={FaReddit}
              displayText={`r/${snippet.communnityId}`}
              imageURL={snippet.imageUrl}
              iconColor="brand.100"
              link={`/r/${snippet.communnityId}`}
            />
          ))}
      </Box>

      <Box pl={3} mb={4}>
        <Text pl={3} mb={1} fontSize="7pt" fontWeight={500} color="gray.500">
          MY COMMUNITIES
        </Text>
        <MenuItem
          bg="white"
          width="100%"
          fontSize="10pt"
          _hover={{ bg: "gray.100" }}
          onClick={() =>
            setCommunityStateModal((prev) => ({ ...prev, modal: true }))
          }
        >
          <Flex align="center">
            <Icon as={GrAdd} mr={2} fontSize={20} />
            Create Communtity
          </Flex>
        </MenuItem>

        {mySnippet.map((snippet) => (
          <MenuListItem
            key={snippet.communnityId}
            icon={FaReddit}
            displayText={`r/${snippet.communnityId}`}
            imageURL={snippet.imageUrl}
            iconColor="blue.500"
            link={`/r/${snippet.communnityId}`}
          />
        ))}
      </Box>
    </>
  );
};
export default Communities;
