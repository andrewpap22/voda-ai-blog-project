import { SignOutButton } from "@clerk/nextjs";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { useBlockLayout, useTable } from "react-table";
import { FixedSizeList } from "react-window";
import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";

interface Post {
  id: number;
  title: string;
  body: string;
}

const Blog: NextPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const postsQuery = api.posts.getAll.useQuery({ page, pageSize });

  // Transform the data into the format required by react-table
  const data = useMemo(
    () => (postsQuery.data ? postsQuery.data.posts : []),
    [postsQuery.data]
  );

  const columns = useMemo(
    () => [
      {
        Header: "Title",
        accessor: "title" as const, // field name
        Cell: ({ row }: any) => {
          const router = useRouter();
          return (
            <div onClick={() => router.push(`/post/${row.original.id}`)}>
              {row.original.title}
            </div>
          );
        },
      },
      {
        Header: "User ID",
        accessor: "userId" as const,
      },
      {
        Header: "Actions",
        accessor: "id" as const,
        Cell: ({ row }: any) => {
          // Replace this with actual like/unlike functionality
          return (
            <button
              onClick={() => console.log(`Liked post ${row.original.id}`)}
            >
              Like
            </button>
          );
        },
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
    <>
      <div className="flex min-h-screen flex-col items-center justify-center py-2">
        <h1 className="text-6xl font-bold">📚 Blog</h1>
        <p className="mt-3 text-2xl">Welcome to the Voda-AI Blog Project!</p>

        <hr className="my-6 w-full border-2 border-gray-200" />

        <div className="rounded-md border-2 border-gray-200 p-4">
          <div {...getTableProps()} className="table">
            <div>
              {headerGroups.map((headerGroup) => (
                <div {...headerGroup.getHeaderGroupProps()} className="tr">
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
                itemCount={rows.length}
                itemSize={35}
                width={totalColumnsWidth}
              >
                {({ index, style }) => {
                  const row = rows[index];

                  if (!row) {
                    return null;
                  }

                  prepareRow(row);
                  return (
                    <div {...row.getRowProps({ style })} className="tr">
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
        >
          Previous Page <Icons.arrowLeft />
        </Button>

        <Button
          onClick={() => setPage((page) => page + 1)}
          disabled={page === postsQuery.data?.pagination.totalPages}
        >
          Next Page <Icons.arrowRight />
        </Button>

        <div className="mt-6 flex flex-col items-center justify-center">
          <Button>
            <Icons.doorOpen /> <SignOutButton />
          </Button>
        </div>
      </div>
    </>
  );
};

export default Blog;
