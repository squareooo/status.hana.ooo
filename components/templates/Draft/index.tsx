import { NextPage } from "next";
import Head from "next/head";
import "katex/dist/katex.min.css";
import "katex/contrib/mhchem";

import { Props } from "./type";
import { useStates } from "./states";
import { useHandlers } from "./handlers";
import { useEffects } from "./effects";

import renderStyles from "@/styles/render";
import { styled } from "@/lib/stitches.config";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import Blocks from "@/components/organisms/Blocks";

const StyledContainer = styled("div", {
  minHeight: "100%",
  display: "flex",
  height: "100%",
});

const StyledBox = styled("div", {
  position: "relative",
  width: "50%",
  flex: "1 1",
  flexDirection: "column",
  overflowY: "auto",
});

const StyledTitle = styled("input", {
  border: "none",
  outline: "none",
  background: "none",
  width: "100%",
  fontSize: "2rem",
  padding: "2rem",
});

const StyledPreview = styled("div", {
  fontSize: "1rem",
  padding: "0 2rem 2rem 2rem",
  wordWrap: "break-word",
  "& img": {
    maxWidth: "100%",
  },
});

const HoverItems = styled("div", {
  display: "flex",
  visibility: "hidden",
  flexDirection: "column",
});

const Boxed = styled("div", {
  display: "flex",
  padding: "0.5rem 0",
  margin: "0.5rem 0",
  "&:hover": {
    [`& ${HoverItems}`]: {
      visibility: "visible",
    },
  },
});

const StyledTextarea = styled("textarea", {
  width: "100%",
  border: "none",
  resize: "none",
  outline: "none",
  height: "16rem",
  fontSize: "1rem",
  padding: "0 0.5rem",
  background: "transparent",
  scrollbarWidth: "none",
  "-ms-overflow-style": "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
});

const StyledAction = styled("div", {
  width: "100%",
  padding: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "right",
});

const Draft: NextPage<Props> = (props) => {
  const state = useStates(props);
  const {
    handleTitleChange,
    createBlock,
    deleteBlock,
    handleTextareaInput,
    handleTextareaDrop,
  } = useHandlers(state);
  useEffects(state);

  return (
    <>
      <Head>
        <title>Hana Draft</title>
      </Head>

      <StyledContainer>
        <StyledBox>
          <StyledTitle spellCheck="false" readOnly value={state.title} />

          <StyledPreview>
            <Blocks blocks={state.blocks} />
          </StyledPreview>
        </StyledBox>

        <StyledBox style={{ background: "#7f00ff0f" }}>
          <StyledTitle
            placeholder="Title"
            spellCheck="false"
            value={state.title}
            onChange={handleTitleChange}
          />

          {state.blocks?.map((block: any, index) => (
            <Boxed key={block.node.id}>
              <HoverItems>
                <Icon onClick={() => deleteBlock(index)}>close</Icon>
                <Icon onClick={() => createBlock(index)}>add</Icon>
              </HoverItems>

              <StyledTextarea
                placeholder="Text"
                spellCheck="false"
                value={block.node.markdown}
                onInput={(e) => handleTextareaInput(e, block, index)}
                onDrop={(e) => handleTextareaDrop(e, index)}
              />
            </Boxed>
          ))}

          {state.blocks.length == 0 && (
            <StyledAction>
              <Button onClick={() => createBlock(-1)}>블록 추가</Button>
            </StyledAction>
          )}
        </StyledBox>
      </StyledContainer>

      <style jsx global>
        {renderStyles}
      </style>
    </>
  );
};

export default Draft;
