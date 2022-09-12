import axios from "axios";
import mime from "mime-types";

import { States } from "./type";

import { initializeApollo } from "@/lib/apollo";
import { useCreateBlockMutation } from "@/lib/mutations/createBlock.gql";
import {
  CreatePresignedPostDocument,
  CreatePresignedPostMutationResult,
  CreatePresignedPostMutationVariables,
} from "@/lib/mutations/createPresignedPost.gql";
import { useDeleteBlockMutation } from "@/lib/mutations/deleteBlock.gql";
import { useUpdateBlockMutation } from "@/lib/mutations/updateBlock.gql";
import { useUpdateTestMutation } from "@/lib/mutations/updateTest.gql";

export const useHandlers = (state: States) => {
  const testId = state.query.id;
  const apolloClient = initializeApollo();
  const [createBlockMutation] = useCreateBlockMutation();
  const [updateBlockMutation] = useUpdateBlockMutation();
  const [deleteBlockMutation] = useDeleteBlockMutation();
  const [updateTestMutation] = useUpdateTestMutation();

  const handleTextareaDrop = (e: any, index: number) => {
    if (!e.dataTransfer.files[0]) return;

    e.preventDefault();
    const files = [...e.dataTransfer.files];
    files.forEach(async (file) => {
      if (file.name.startsWith(".")) return alert("이 파일은 숨겨져 있습니다.");
      if (file.size >= 10485760) return alert("10MB를 초과하였습니다.");
      const contentType = mime.lookup(file.name);
      if (contentType === false) return alert("파일 형식을 지원하지 않습니다.");

      const newBlocks = JSON.parse(JSON.stringify(state.blocks));
      const newBlock = newBlocks[index];
      const isImage = contentType.startsWith("image/");
      const newline = newBlock.node.markdown ? "\n" : "";
      const fileType = isImage ? "!" : "";
      const fileName = isImage ? file.name.replace(/.\w*$/, "") : file.name;

      const { data } = (await apolloClient.mutate({
        mutation: CreatePresignedPostDocument,
        variables: {
          input: {
            testId: testId,
            fileName: file.name,
          },
        } as CreatePresignedPostMutationVariables,
      })) as CreatePresignedPostMutationResult;
      if (data == null) return;

      const formData = new FormData();
      const fields = data.createPresignedPost.fields;
      if (fields.ContentType) {
        formData.append("Content-Type", fields.ContentType);
      }
      formData.append("bucket", fields.bucket);
      formData.append("X-Amz-Algorithm", fields.XAmzAlgorithm);
      formData.append("X-Amz-Credential", fields.XAmzCredential);
      formData.append("X-Amz-Date", fields.XAmzDate);
      formData.append("key", fields.key);
      formData.append("Policy", fields.Policy);
      formData.append("X-Amz-Signature", fields.XAmzSignature);
      formData.append("file", file);

      await axios.post(data.createPresignedPost.url, formData);

      const url = `${data.createPresignedPost.url}/${fields.key}`;
      newBlock.node.markdown += `${newline}${fileType}[${fileName}](${url})\n`;

      updateBlockMutation({
        variables: {
          input: {
            id: newBlock.node.id,
            markdown: newBlock.node.markdown,
          },
        },
      });
      state.setBlocks(newBlocks);
      e.dispatchEvent(new Event("InputEvent"));
    });
  };

  const handleTitleChange = (e: any) => {
    updateTestMutation({
      variables: {
        input: {
          id: testId,
          name: e.target.value,
        },
      },
    });
    state.setTitle(e.target.value as string);
  };

  const handleTextareaHeight = (e: any) => {
    const textarea: any = e?.target ?? e;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleTextareaInput = (e: any, block: any, index: number) => {
    const newBlocks = JSON.parse(JSON.stringify(state.blocks));
    updateBlockMutation({
      variables: {
        input: {
          id: block.node.id,
          markdown: e.target.value,
        },
      },
    });
    newBlocks[index].node.markdown = e.target.value;
    state.setBlocks(newBlocks);
    handleTextareaHeight(e);
  };

  const deleteBlock = async (index: number) => {
    const newBlocks = JSON.parse(JSON.stringify(state.blocks));
    await deleteBlockMutation({
      variables: {
        input: {
          id: newBlocks[index].node.id,
        },
      },
    });
    newBlocks.splice(index, 1);
    newBlocks.map((block: any, index: number) => {
      if (block.node.index == index) return;

      updateBlockMutation({
        variables: {
          input: {
            id: block.node.id,
            index: index,
          },
        },
      });
      block.node.index = index;
    });
    state.setBlocks(newBlocks);
  };

  const createBlock = async (index: number) => {
    const newBlocks = JSON.parse(JSON.stringify(state.blocks));
    const newBlockIndex = index + 1;
    const { data } = await createBlockMutation({
      variables: {
        input: {
          testId: state.query.id,
          index: newBlockIndex,
          markdown: "",
        },
      },
    });
    newBlocks.splice(newBlockIndex, 0, {
      node: data?.createBlock,
    });
    newBlocks.map((block: any, index: number) => {
      if (block.node.index == index) return;

      updateBlockMutation({
        variables: {
          input: {
            id: block.node.id,
            index: index,
          },
        },
      });
      block.node.index = index;
    });
    state.setBlocks(newBlocks);
  };

  return {
    handleTextareaDrop,
    handleTitleChange,
    handleTextareaHeight,
    handleTextareaInput,
    deleteBlock,
    createBlock,
  };
};
