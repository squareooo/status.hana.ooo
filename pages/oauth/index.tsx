import type { NextPage } from "next";
import { useEffect } from "react";
import Head from "next/head";
import Router, { useRouter } from "next/router";

import cookieStorage from "@/lib/cookieStorage";
import { useTokenMutation } from "@/lib/mutations/token.graphql";

export default (() => {
  const router = useRouter();
  const [tokenMutation] = useTokenMutation();

  useEffect(() => {
    if (!router.query.code) return;

    tokenMutation({
      variables: {
        input: {
          grantType: "authorization_code",
          code: router.query.code as string,
        },
      },
      update: (cache, mutationResult) => {
        const { data } = mutationResult;

        if (!data) return;

        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        cookieStorage.setItem(
          "access_token",
          data.token.accessToken as string,
          {
            expires: date,
          }
        );
        localStorage.setItem("id_token", data.token.idToken as string);
        localStorage.setItem("token_type", data.token.tokenType as string);

        Router.push("/");
      },
    });
  }, [router.query.code, tokenMutation]);

  return (
    <>
      <Head>
        <title>Hana OAuth</title>
      </Head>
    </>
  );
}) as NextPage;
