import { useRouter } from "next/router";
import { useMemo } from "react";
import { useBlockLayout, useTable } from "react-table";
import Authenticated from "./authenticated";

import { NextPage } from "next";
import { FixedSizeList } from "react-window";
import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";

const MyLikedPosts: NextPage = () => {
  const router = useRouter();
  const postsQuery = api.posts.myLikedPosts.useQuery({});

  const { mutateAsync: unlikeMutation } = api.posts.unlikePost.useMutation({
    onSettled: () => {
      postsQuery.refetch();
    },
  });

  const { mutateAsync: unlikeAllMutation } =
    api.posts.unlikeAllPosts.useMutation({
      onSettled: () => {
        postsQuery.refetch();
      },
    });

  // Transform the data into the format required by react-table
  const data = useMemo(() => postsQuery.data ?? [], [postsQuery.data]);

  const columns = useMemo(
    () => [
      {
        Header: "Title",
        accessor: "title" as const, // field name
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
        Header: "Actions",
        accessor: "id" as const,
        Cell: ({ row }: any) => (
          <Button
            onClick={async () => {
              await unlikeMutation({ postId: row.original.id });
            }}
          >
            <Icons.unlike />
          </Button>
        ),
      },
    ],
    []
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
    <Authenticated>
      <div className="flex min-h-screen flex-col items-center justify-center py-2">
        <h3 className="pb-4 text-6xl font-bold">👍 My Liked Posts</h3>
        <p className="pb-4 text-2xl font-bold">
          <u>{postsQuery.data?.length}</u> posts liked
        </p>

        <div className="rounded-md border-2 border-gray-200 p-4">
          <div {...getTableProps()} className="table">
            <div>
              {headerGroups.map((headerGroup) => (
                <div
                  {...headerGroup.getHeaderGroupProps()}
                  className="tr border-b border-gray-200 py-1"
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
                itemCount={postsQuery.isFetching ? 1 : rows.length}
                itemSize={35}
                width={totalColumnsWidth}
              >
                {({ index, style }) => {
                  // Simple spinner for loading state
                  if (postsQuery.isFetching) {
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
          onClick={async () => {
            await unlikeAllMutation({});
            postsQuery.refetch();
          }}
          variant="outline"
          className="my-2"
        >
          Unlike All
        </Button>

        <hr className="my-6 w-11 border-2 border-gray-200" />

        <Button
          className="mt-4"
          onClick={() => router.push("/")}
          variant="outline"
        >
          <Icons.home /> &nbsp; Return to home page
        </Button>
      </div>
    </Authenticated>
  );
};

export default MyLikedPosts;
