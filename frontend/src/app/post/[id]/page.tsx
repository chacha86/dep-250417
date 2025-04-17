import ErrorPage from "@/components/business/ErrorPage";
import { client } from "@/lib/backend/client";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import ClientPage from "./ClientPage";

// Define consistent params type
type PageParams = {
  id: string;
};

// Updated Page component without using await on params
export default async function Page({ params }: { params: PageParams }) {
  const id = Number(params.id);
  const res = await fetchPost(id);

  if (res.error) {
    return <ErrorPage msg={res.error.msg} />;
  }

  const post = res.data.data;

  const postGenFilesResponse = await client.GET(
    "/api/v1/posts/{postId}/genFiles",
    {
      params: { path: { postId: post.id } },
      headers: {
        cookie: (await cookies()).toString(),
      },
    }
  );

  if (postGenFilesResponse.error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        {postGenFilesResponse.error.msg}
      </div>
    );
  }

  const postGenFiles = postGenFilesResponse.data;

  return <ClientPage post={post} postGenFiles={postGenFiles} />;
}

// Updated Props type to match Next.js expectations
type Props = {
  params: PageParams;
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;

  const res = await fetchPost(Number(id));

  if (res.error) {
    return {
      title: res.error.msg,
      description: res.error.msg,
    };
  }

  const post = res.data.data;

  return {
    title: post.title,
    description: post.content,
  };
}

async function fetchPost(id: number) {
  const response = await client.GET("/api/v1/posts/{id}", {
    params: {
      path: {
        id,
      },
    },
    headers: {
      cookie: (await cookies()).toString(),
    },
  });

  return response;
}
