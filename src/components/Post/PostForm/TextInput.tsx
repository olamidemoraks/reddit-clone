import React from "react";
import { Stack, Input, Textarea, Button, Flex } from "@chakra-ui/react";
type TextInputProps = {
  textInput: {
    title: string;
    body: string;
  };
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleCreate: () => void;
  loading: boolean;
};

const TextInput: React.FC<TextInputProps> = ({
  textInput,
  handleCreate,
  loading,
  onChange,
}) => {
  return (
    <Stack spacing={3} width="100%">
      <Input
        name="title"
        // value={}
        fontSize="10pt"
        borderRadius={4}
        placeholder="Title"
        onChange={onChange}
        _placeholder={{
          color: "gray.500",
        }}
        required={true}
        color="black"
        _focus={{
          ouline: "none",
          bg: "white",
          border: "1px solid",
          borderColor: "black",
        }}
      />
      <Textarea
        name="body"
        // value={}
        color="black"
        height="100px"
        fontSize="10pt"
        borderRadius={4}
        placeholder="Text (optional)"
        onChange={onChange}
        _placeholder={{
          color: "gray.500",
        }}
        _focus={{
          ouline: "none",
          bg: "white",
          border: "1px solid",
          borderColor: "black",
        }}
      />
      <Flex justify={"flex-end"}>
        <Button
          height="34px"
          padding="0px 30px"
          disabled={!textInput.title}
          onClick={handleCreate}
          isLoading={loading}
        >
          Post
        </Button>
      </Flex>
    </Stack>
  );
};
export default TextInput;
