import type { NextPage } from "next";
import Hana from "hana.js";
import { useEffect } from "react";
import Link from "next/link";

import { styled } from "@/lib/stitches.config";
import cookieStorage from "@/lib/cookieStorage";
import Container from "@/components/atoms/Container";
import Button from "@/components/atoms/Button";
import { useStore } from "@/store";

const StyledButton = styled(Button, {
  marginRight: "0.5rem",
});

const StyledHeader = styled("div", {
  display: "flex",
  padding: "1rem 0",
  alignItems: "center",
  justifyContent: "space-between",
});

const StyledTitle = styled("h2", {
  color: "#7f00ff",
});

const StyeldBox = styled("div", {
  display: "flex",
  alignItems: "center",
});

const AppBar: NextPage = () => {
  const { auth } = useStore();

  useEffect(() => {
    auth.setAccessToken(cookieStorage.getItem("access_token") ?? "");
  }, [auth.setAccessToken]);

  Hana.init({ clientId: process.env.NEXT_PUBLIC_CLIENT_ID as string });

  const signIn = () => {
    Hana.Auth.authorize({
      redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI as string,
    });
  };

  const signOut = () => {
    auth.setAccessToken("");
    cookieStorage.removeItem("access_token");
  };

  const Actions = () => (
    <>
      <Button onClick={signOut}>로그아웃</Button>
    </>
  );

  return (
    <Container>
      <StyledHeader>
        <StyeldBox>
          <Link href="/" passHref>
            <StyledTitle>Test</StyledTitle>
          </Link>
        </StyeldBox>

        <StyeldBox>
          {auth.accessToken && Actions()}

          {!auth.accessToken && <StyledButton onClick={signIn}>로그인</StyledButton>}
        </StyeldBox>
      </StyledHeader>
    </Container>
  );
};

export default AppBar;
