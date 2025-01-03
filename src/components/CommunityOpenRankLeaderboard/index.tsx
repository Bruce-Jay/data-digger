import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, message, ConfigProvider } from 'antd';
import Leaderboard from './Leaderboard';
import Details from './Details';
import Graph from './Graph';
import Banner from './Banner';
import { translate } from '@docusaurus/Translate';
import styles from './styles.module.css';

const DevLeaderboard = () => {
	// test url: http://localhost:3000/community_openrank_leaderboard?platform=github&repo=X-lab2017/open-digger&date=202410
	

	const [graph, setGraph] = useState(null);
	const [selectedNodeId, setSelectedNodeId] = useState(null);
	const [platform, setPlatform] = useState<string>("");
	const [date, setDate] = useState<string>("");
	const [dateKeys, setDateKeys] = useState<string[]>([]);
	const [datePlaceholder, setDatePlaceholder] = useState<string>("");
  

	const baseUrl = "https://oss.x-lab.info/open_digger/";
	const typeMap = new Map([
		["r", "repo"],
		["i", "issue"],
		["p", "pull"],
		["u", "user"],
	]);

	const loadData = async (platform: string, repoName: string) => {
		const hide = message.loading(
			translate({ id: "communityLeaderboard.fetchingData" }),
			0
		);
		try {
			const data = (
				await axios.get(
					`${baseUrl}${platform}/${repoName}/community_openrank.json`
				)
			).data;
			if (!data || Object.keys(data).length === 0) {
				throw "No valid data found";
			}
			const keys = Object.keys(data.data);
			const lastKey = keys[keys.length - 1];
			const formattedLastKey = `${lastKey.slice(0, 4)}-${lastKey.slice(4)}`;
			setGraph(data);
			setDate(lastKey);
			setDatePlaceholder(formattedLastKey);
			setDateKeys(keys);
			setPlatform(platform);
		} catch (error) {
			message.error(translate({ id: "communityLeaderboard.fetchDataError" }));
			console.error(error);
		} finally {
			hide();
		}
	};


	useEffect(() => {
		if (graph) {
			const keys = Object.keys(graph.data);
			if (!keys.includes(date)) {
				message.error(translate({ id: "communityLeaderboard.noDataForMonth" }));
				return;
			}
			setSelectedNodeId(-1);
		}
	}, [date]);

	const handleNodeDblClick = (id) => {
		setSelectedNodeId(id);
	};

	const disabledDate = (current) => {
		const formattedDate = current.format("YYYYMM");
		return !dateKeys.includes(formattedDate);
	};

	const onRepoSubmit = (values: any) => {
		loadData(values.platform.toLowerCase(), values.name);
	};

	useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
		const urlPlatform = urlParams.get("platform");
		const urlRepo = urlParams.get("repo");
		const urlDate = urlParams.get("date");
		console.log("16", urlPlatform, urlRepo, urlDate);
    if (urlPlatform && urlRepo && urlDate) {
      loadData(urlPlatform, urlRepo);
      setDate(urlDate);
    } else {
      loadData("github", "X-lab2017/open-digger");
    }
	}, []);

  const handleShareClick = async() => {
		const repoName = graph.repo || "X-lab2017/open-digger";
		const generatedUrl = `${window.location.origin}${window.location.pathname}?platform=${platform}&repo=${repoName}&date=${date}`;
		console.log("generatedUrl", generatedUrl);
		
    try {
			await navigator.clipboard.writeText(generatedUrl);
			message.success("链接复制成功!");
		} catch (err) {
			console.error("Failed to copy: ", err);
		}
	}

	return (
		<>
			<Banner
				onSubmit={onRepoSubmit}
				setDate={setDate}
				datePlaceholder={datePlaceholder}
				disabledDate={disabledDate}
			/>
			<ConfigProvider
				theme={{
					components: {
						Button: {
							primaryColor: "#3366ff",
						},
					},
				}}
			>
				<Button className={styles.shareButton} onClick={handleShareClick}>分享榜单</Button>
			</ConfigProvider>

			<Graph
				graph={graph}
				month={date}
				platform={platform}
				typeMap={typeMap}
				onNodeDblClick={handleNodeDblClick}
			/>
			<Leaderboard graph={graph} month={date} />
			<Details
				graph={graph}
				id={selectedNodeId}
				month={date}
				typeMap={typeMap}
				platform={platform}
			/>
		</>
	);
};

export default DevLeaderboard;
