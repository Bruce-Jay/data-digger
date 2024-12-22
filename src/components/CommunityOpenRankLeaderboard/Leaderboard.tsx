import React, { useEffect, useState } from "react";
import { translate } from "@docusaurus/Translate";
import SimpleTable from "../SimpleTable";
import styles from "./styles.module.css";

const Leaderboard = ({ graph, month }) => {
  const [users, setUsers] = useState([]);

  const getPreviousMonth = (monthString) => {
    if (!/^\d{6}$/.test(monthString)) {
      return "Invalid month format, please use YYYYMM";
    }

    const year = parseInt(monthString.slice(0, 4), 10);
    const month = parseInt(monthString.slice(4, 6), 10);
    // 创建 Date 对象，月份是从 0 开始的，所以要减去 1
    const date = new Date(year, month - 1);
    // 获取上个月的日期
    date.setMonth(date.getMonth() - 1);

    const previousYear = date.getFullYear();
    const previousMonth = date.getMonth() + 1;
    const formattedMonth =
      previousMonth < 10 ? `0${previousMonth}` : previousMonth;
    return `${previousYear}${formattedMonth}`;
  };

  useEffect(() => {
    if (graph) {
      const keys = Object.keys(graph.data);
      if (!keys.includes(month)) {
        return;
      }
      const previousMonth = getPreviousMonth(month);
      const sortedUsers = graph.data[month].nodes
        .map((node) => {
          const id = graph.meta.nodes[node[0]][0];
          const login = graph.meta.nodes[node[0]][1];
          const value = node[2];
          // 查找 previousMonth 对应的 value
          const previousNode = graph.data[previousMonth]?.nodes.find(
            (prevNode) => graph.meta.nodes[prevNode[0]][0] === id
          );
          const valuePrev = previousNode ? previousNode[2] : null;
          const valueDelta = valuePrev ? value - valuePrev : null;
          return {
            id,
            login,
            value,
            valueDelta,
          };
        })
        .filter((user) => user.id[0] === "u")
        .sort((a, b) => b.value - a.value);
      setUsers(sortedUsers);
    }
  }, [graph, month]);

  return (
    <div className={styles.leftBox}>
      <SimpleTable
        title={translate({ id: "communityLeaderboard.leaderboard.title" })}
        data={users}
        options={[
          {
            name: translate({ id: "communityLeaderboard.leaderboard.login" }),
            type: "String",
            fields: ["login"],
            width: 200,
          },
          { name: "OpenRank", type: "NumberWithDelta", fields: ["value", "valueDelta"], width: 100 },
        ]}
      />
    </div>
  );
};

export default Leaderboard;
