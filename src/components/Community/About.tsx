import {
  Community,
  CommunitySnippets,
  communityState,
} from "@/atoms/communitiesAtoms";
import { useRef, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Icon,
  Stack,
  Divider,
  Button,
  Spinner,
  Image,
} from "@chakra-ui/react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { RiCakeLine } from "react-icons/ri";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore, storage } from "@/firebase/clientApp";
import useSelectFile from "@/hooks/useSelectFile";
import { FaReddit } from "react-icons/fa";
import { async } from "@firebase/util";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { collection, doc, updateDoc } from "firebase/firestore";
import { useRecoilState, useSetRecoilState } from "recoil";

type AboutProps = {
  communityData: Community;
};

const About: React.FC<AboutProps> = ({ communityData }) => {
  const setCommunityStateValue = useSetRecoilState(communityState);
  const { onSelectFile, selectedFile, setSelectedFile } = useSelectFile();
  const [user] = useAuthState(auth);
  const router = useRouter();
  const selectedFileRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [communityStateValue, setCommunityState] =
    useRecoilState(communityState);

  const onUpdateImage = async () => {
    if (!selectedFile) return;
    setUploadingImage(true);
    try {
      const imageRef = ref(storage, `communities/${communityData.id}image`);
      await uploadString(imageRef, selectedFile, "data_url");
      const downloadURL = await getDownloadURL(imageRef);

      await updateDoc(doc(firestore, `communities/${communityData.id}`), {
        imageUrl: downloadURL,
      });
      await updateDoc(
        doc(
          firestore,
          `users/${user?.uid}/communitySnippets/${communityData.id}`
        ),
        {
          imageUrl: downloadURL,
        }
      );

      // await updateDocs

      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          imageUrl: downloadURL,
        } as Community,
      }));
      // const snippet = communityStateValue.mySnippets.map((item) => {
      //   if (item.communnityId === communityData.id) {
      //     return { ...item, imageUrl: downloadURL };
      //   }
      //   return item;
      // });
      // console.log(snippet);

      setCommunityState((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.map((item) => {
          if (item.communnityId === communityData.id) {
            return { ...item, imageUrl: downloadURL };
          }
          return item;
        }),
      }));

      setUploadingImage(false);
    } catch (error) {
      console.log("uploadImage error", error);
    }
  };

  return (
    <Box position="sticky" top="14px">
      <Flex
        justify="space-between"
        align="center"
        bg="blue.400"
        color="white"
        p={3}
        borderRadius="4px 4px 0 0 "
      >
        <Text color="white" fontSize="10pt">
          About Community
        </Text>
        <Icon as={HiOutlineDotsHorizontal} />
      </Flex>

      <Flex direction="column" p={3} bg="white" borderRadius="0px 0px 4px 4px">
        <Stack>
          <Flex width="100%" p={2}>
            <Flex direction="column" flexGrow={1} fontWeight={700}>
              <Text>{communityData.numberOfMember.toLocaleString()}</Text>{" "}
              <Text>Members</Text>
            </Flex>
            <Flex direction="column" flexGrow={1} fontWeight={700}>
              <Text>1</Text> <Text>Online</Text>
            </Flex>
          </Flex>
          <Divider />
          <Flex
            align="center"
            width="100%"
            padding={1}
            fontWeight={500}
            fontSize="10pt"
          >
            <Icon as={RiCakeLine} fontSize={18} mr={2} color="black" />
            {communityData.createdAt && (
              <Text>
                Created{" "}
                {moment(
                  new Date(communityData.createdAt.seconds * 1000)
                ).format("MMM DD, YYYY")}
              </Text>
            )}
          </Flex>
          <Link href={`/r/${communityData.id}/submit`}>
            <Button mt={3} height="30px" width="100%">
              Create Post
            </Button>
          </Link>
          {user?.uid === communityData.creatorId && (
            <>
              <Divider />
              <Stack spacing={1} fontSize="10pt">
                <Text fontWeight={600}>Admin</Text>
                <Flex align="center" justify="space-between">
                  <Text
                    color="blue.500"
                    cursor="pointer"
                    _hover={{ textDecoration: "underline" }}
                    onClick={() => {
                      selectedFileRef.current?.click();
                    }}
                  >
                    Change Image
                  </Text>
                  {communityData.imageUrl || selectedFile ? (
                    <Image
                      src={selectedFile || communityData.imageUrl}
                      borderRadius="full"
                      boxSize="40px"
                      alt="community image"
                    />
                  ) : (
                    <Icon
                      as={FaReddit}
                      fontSize={40}
                      mr={2}
                      color="brand.100"
                    />
                  )}
                </Flex>
                {selectedFile &&
                  (uploadingImage ? (
                    <Spinner />
                  ) : (
                    <Text cursor="pointer" onClick={onUpdateImage}>
                      Save Changes
                    </Text>
                  ))}
                <input
                  type="file"
                  accept="image/x-png,image/gif, image/jpeg"
                  hidden
                  ref={selectedFileRef}
                  onChange={onSelectFile}
                />
              </Stack>
            </>
          )}
        </Stack>
      </Flex>
    </Box>
  );
};
export default About;
