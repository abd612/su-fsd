import React from "react";
import Dropdown from "./components/Dropdown";

type propsType = {
  fileData: string[][];
};

const SORT_TYPES = {
  CREATED: "created",
  NAME_ASC: "name-asc",
  NAME_DESC: "name-desc",
};

const SORT_TEXTS = {
  [SORT_TYPES.CREATED]: "Sort by Created At",
  [SORT_TYPES.NAME_ASC]: "Sort by File Name (Ascending)",
  [SORT_TYPES.NAME_DESC]: "Sort by File Name (Descending)",
};

const stringToTokens = (input: string) => {
  const inputWithoutExtension = input.replace(/\.[^/.]+$/, "");
  const splittedArray = inputWithoutExtension.split(/(\d+)/).filter(Boolean);

  const numArray = splittedArray.map((part) => {
    if (isNaN(parseInt(part))) {
      return Array.from(part).map((char) => char.charCodeAt(0));
    }

    return parseInt(part);
  });

  return numArray.flat();
};

const customStringSort = (a: string, b: string) => {
  const tokensA = stringToTokens(a);
  const tokensB = stringToTokens(b);

  for (let i = 0; i < Math.min(tokensA.length, tokensB.length); i++) {
    if (tokensA[i] !== tokensB[i]) {
      return tokensA[i] < tokensB[i] ? -1 : 1;
    }
  }

  return tokensA.length - tokensB.length;
};

const DataSorter: React.FC<propsType> = (props: propsType) => {
  const fileData = props.fileData;

  const [sortType, setSortType] = React.useState(SORT_TYPES.CREATED);

  const sortOptions = Object.values(SORT_TYPES).map((type) => {
    return {
      title: SORT_TEXTS[type],
      onClick: () => {
        setSortType(type);
      },
    };
  });

  const sortData = (data: string[][], sortType: string) => {
    switch (sortType) {
      case SORT_TYPES.CREATED:
        return data.sort((a, b) => {
          const dateA = new Date(a[0]);
          const dateB = new Date(b[0]);
          return dateA.getTime() - dateB.getTime();
        });
      case SORT_TYPES.NAME_ASC:
        return data.sort((a, b) => {
          return customStringSort(a[1], b[1]);
        });
      case SORT_TYPES.NAME_DESC:
        return data.sort((a, b) => {
          return customStringSort(b[1], a[1]);
        });
      default:
        return data;
    }
  };

  const sortedData = React.useMemo(
    () => sortData(fileData, sortType),
    [fileData, sortType],
  );

  return (
    <div className="flex flex-col items-center w-full h-screen overflow-y-scroll bg-white p-10 text-black space-y-8">
      <h1 className="font-bold text-3xl">Data Sorter</h1>
      <Dropdown selectedItem={SORT_TEXTS[sortType]} items={sortOptions} />
      <div className="text-black space-y-4">
        {sortedData.map((data, index) => {
          const createdAt = data[0];
          const fileName = data[1];
          return (
            <div
              key={index}
              className="flex flex-col border border-solid border-gray-500 w-60 rounded-xl p-2"
            >
              <div>{createdAt}</div>
              <div className="text-lg font-medium">{fileName}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const getServerSideProps = async () => {
  const hostUrl = process.env.HOST_URL || "http://localhost:3000";
  const response = await fetch(`${hostUrl}/api/fetch-data`);
  const responseJson = await response.json();

  return {
    props: {
      fileData: responseJson.data,
    },
  };
};

export default DataSorter;
