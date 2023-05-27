import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { useBlockLayout, useTable } from "react-table";
import { FixedSizeList } from "react-window";

import { SignOutButton } from "@clerk/nextjs";
import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";

const Blog: NextPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const router = useRouter();
  const postsQuery = api.posts.getAll.useQuery({ page, pageSize });
  const likeMutation = api.posts.likePost.useMutation();
  const unlikeMutation = api.posts.unlikePost.useMutation();

  /// we will use this to invalidate the query when the user likes or unlikes a post
  const utils = api.useContext();

  // Transform the data into the format required by react-table
  const data = useMemo(
    () => (postsQuery.data ? postsQuery.data.posts : []),
    [postsQuery.data]
  );

  const columns = useMemo(
    () => [
      {
        Header: "Title",
        accessor: "title" as const,
        Cell: ({ row }: any) => (
          <div
            className="cursor-pointer text-blue-500 hover:underline"
            onClick={() => router.push(`/post/${row.original.id}`)}
          >
            {row.original.title.length > 15
              ? `${row.original.title.substring(0, 15)}...`
              : row.original.title}
          </div>
        ),
      },
      {
        Header: "User ID",
        accessor: "userId" as const,
      },
      {
        Header: "Actions",
        accessor: "id" as const,
        Cell: ({ row }: any) => {
          // Checking if the current user has already liked the post
          const isLikedByUser = row.original.isLiked;

          return (
            <Button
              onClick={async () => {
                if (!row.original.isLiked) {
                  await likeMutation.mutateAsync({ postId: row.original.id });

                  // Invalidate the query so that the new data is fetched
                  await utils.posts.getAll.invalidate({ page, pageSize });
                } else {
                  await unlikeMutation.mutateAsync({ postId: row.original.id });
                  await utils.posts.getAll.invalidate({ page, pageSize });
                }
              }}
              className="w-22 h-22 flex items-center justify-center pb-2"
            >
              {isLikedByUser ? <Icons.unlike /> : <Icons.heart />}
            </Button>
          );
        },
      },
    ],
    [likeMutation.mutate]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    totalColumnsWidth,
  } = useTable({ columns, data }, useBlockLayout);

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center py-2">
        <h1 className="text-6xl font-bold">📚 Blog</h1>
        <p className="mt-3 text-2xl">Welcome to the Voda-AI Blog Project!</p>

        <hr className="my-6 w-full border-2 border-gray-200" />

        <div className="rounded-md border-2 border-gray-200 p-4">
          <div {...getTableProps()} className="table">
            <div>
              {headerGroups.map((headerGroup) => (
                <div
                  {...headerGroup.getHeaderGroupProps()}
                  className="tr border-b-2 border-gray-200"
                >
                  {headerGroup.headers.map((column) => (
                    <div {...column.getHeaderProps()} className="th">
                      {column.render("Header")}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div {...getTableBodyProps()}>
              <FixedSizeList
                height={400}
                itemCount={postsQuery.isLoading ? 1 : rows.length}
                itemSize={35}
                width={totalColumnsWidth}
              >
                {({ index, style }) => {
                  // Simple spinner for loading state
                  if (postsQuery.isLoading) {
                    return (
                      <div style={style} className="tr">
                        <div className="td mt-10 flex items-center justify-center">
                          Loading... &nbsp; <Icons.spinner />
                        </div>
                      </div>
                    );
                  }

                  const row = rows[index];

                  if (!row) {
                    return null;
                  }

                  prepareRow(row);
                  return (
                    <div
                      {...row.getRowProps({ style })}
                      className="tr border-b border-gray-200"
                    >
                      {row.cells.map((cell) => (
                        <div {...cell.getCellProps()} className="td">
                          {cell.render("Cell")}
                        </div>
                      ))}
                    </div>
                  );
                }}
              </FixedSizeList>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setPage((page) => page - 1)}
          disabled={page === 1}
          variant="outline"
          className="mt-2"
        >
          Previous Page <Icons.arrowLeft />
        </Button>

        <Button
          onClick={() => setPage((page) => page + 1)}
          disabled={page === postsQuery.data?.pagination.totalPages}
          variant="outline"
          className="mt-2"
        >
          Next Page <Icons.arrowRight />
        </Button>

        <div className="mt-6 flex flex-col items-center justify-center">
          <Button variant="outline">
            <Icons.doorOpen /> <SignOutButton />
          </Button>
        </div>
      </div>
    </>
  );
};

export default Blog;
