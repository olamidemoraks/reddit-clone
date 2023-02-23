import React from "react";
import { Flex, Button, Text } from "@chakra-ui/react";
import Link from "next/link";

const CommunityNotFound: React.FC = () => {
  return (
    <Flex direction="column" justify="center" align="center" minHeight="60vh">
      <Text color="gray.700">
        Sorry that communty does not exist or has been banned
      </Text>
      <Link href="/">
        <Button mt={4}>GO HOME</Button>
      </Link>
    </Flex>
  );
};
export default CommunityNotFound;
