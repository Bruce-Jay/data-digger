import React, { useState, useEffect } from "react";
import { Tooltip } from "antd";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import axios from "axios";
import Select from "react-select";
import { translate } from "@docusaurus/Translate";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

const selectStyles = (width) => ({
	container: (provided) => ({
		...provided,
		display: "inline-block",
		height: "50px",
		margin: "0px 10px 0px 0px",
		width,
	}),
	control: (provided) => ({
		...provided,
		height: "100%",
	}),
	option: (provided, state) => ({
		...provided,
		backgroundColor: state.isSelected
			? "#3366FF"
			: state.isFocused
			? "#f0f0f0"
			: null,
		color: state.isSelected ? "white" : "black",
	}),
	singleValue: (provided) => ({
		...provided,
		color: "#000",
	}),
});

const submitStyles = {
	padding: "0px 15px 0px 15px",
	borderRadius: "5px",
	background: "#3366FF",
	color: "white",
	border: "none",
	height: "50px",
};

const platforms = ["GitHub", "Gitee"];
const types = ["Repo", "User"];
export const repoMetricOptionMap = new Map<string, string | string[]>([
	["OpenRank", "openrank"],
	["Activity", "activity"],
	["Stars", "stars"],
	["Forks", "technical_fork"],
	["Attention", "attention"],
	["Bus Factor", "bus_factor"],
	["Contributors", "new_contributors"],
	["Issues", ["issues_new", "issues_closed", "issue_comments"]],
	["Issue Response Time", "issue_response_time"],
	["Issue Resolution Duration", "issue_resolution_duration"],
	[
		"Change Requests",
		["change_requests", "change_requests_accepted", "change_requests_reviews"],
	],
	["Change Request Response Time", "change_request_response_time"],
	["Change Request Resolution Duration", "change_request_resolution_duration"],
	["Code Change Lines", ["code_change_lines_add", "code_change_lines_remove"]],
]);
export const userMetricOptionMap = new Map<string, string | string[]>([
	["OpenRank", "openrank"],
	["Activity", "activity"],
]);

interface SearchInputProps {
	platform?: string | boolean;
	type?: string | boolean;
	metric?: string | boolean;
	onSubmit: (arg0: {
		platform: string;
		type: string;
		name: string;
		metric: string;
		metricDisplayName: string;
	}) => void;
}

const ImageCard = ({ repo }) => {
	return (
		<div
			style={{
				width: "100px",
				height: "100px",
			}}
		>
			<img
				src={repo.image}
				alt={repo.name}
				style={{
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
					borderRadius: "8px",
				}}
			/>
			{repo.name.length > 20 ? (
				<Tooltip title={repo.name} placement="top">
					<div style={{ color: "#71717a", fontSize: "12px" }}>
						{repo.name.slice(0, 20) + "..."}
					</div>
				</Tooltip>
			) : (
				<div style={{ color: "#71717a", fontSize: "12px" }}>{repo.name}</div>
			)}
		</div>
	);
};

export default ({
	platform,
	type,
	metric,
	onSubmit,
}: SearchInputProps): JSX.Element => {
	const optionsLimitCount = 20;
	const [repoList, setRepoList] = useState([]);
	const [userList, setUserList] = useState([]);
	const [selectOptions, setSelectOptions] = useState([]);
	const [searchInputValue, setSearchInputvalue] = useState("");
	const [selectedName, setSelectedName] = useState(null);
	const [selectedPlatform, setSelectedPlatform] = useState(null);
	const [selectedType, setSelectedType] = useState(null);
	const [metricOptions, setMetricOptions] = useState([]);
	const [selectedMetric, setSelectedMetric] = useState(null);
	const [adjacentRepo, setAdjacentRepo] = useState([]);

	const { siteConfig } = useDocusaurusContext();
	const { customFields } = siteConfig;
	console.log("83", customFields);

	useEffect(() => {
		let typeValue = type;
		if (type) {
			if (!types.includes(type as string)) {
				typeValue = types[0];
				if (type !== true) {
					alert(`Invalid type: ${type}`);
				}
			}
		} else {
			typeValue = types[0];
		}
		setSelectedType({ value: typeValue, label: typeValue });

		const fetchRepoList = async () => {
			try {
				const response = await axios.get(
					`${customFields.ossBaseUrl}repo_list.csv`
				);
				console.log("134", response.data);
				const data: string = response.data;
				const parsedRepoList = data
					.split("\n")
					.slice(1)
					.map((line) => line.trim().split(","))
					.filter(
						(line) =>
							line.length === 3 &&
							line[0] != "" &&
							line[1] != "" &&
							line[2] != ""
					)
					.map((line) => ({ platform: line[1], name: line[2], id: line[0] }));
				setRepoList(parsedRepoList);
				console.log("141", parsedRepoList);
			} catch (error) {
				console.error("Error fetching repo list:", error);
			}
		};
		const fetchUserList = async () => {
			try {
				const response = await axios.get(
					`${customFields.ossBaseUrl}user_list.csv`
				);
				const data: string = response.data;
				const parsedUserList = data
					.split("\n")
					.slice(1)
					.map((line) => line.trim().split(","))
					.filter((line) => line.length === 3 && line[1] != "" && line[2] != "")
					.map((line) => ({ platform: line[1], name: line[2] }));
				setUserList(parsedUserList);
			} catch (error) {
				console.error("Error fetching user list:", error);
			}
		};
		fetchRepoList();
		fetchUserList();
		// 先行读取 url 参数的逻辑
		const urlParams = new URLSearchParams(window.location.search);
		const urlPlatform = urlParams.get("platform");
		const urlRepo = urlParams.get("repo");
		const urlDate = urlParams.get("date");
		console.log("102", urlPlatform, urlRepo, urlDate);
		if (urlPlatform) {
			if (platforms.includes(urlPlatform as string)) {
				setSelectedPlatform({ value: urlPlatform, label: urlPlatform });
			} else {
				setSelectedPlatform({ value: platforms[0], label: platforms[0] });
			}
		}
		if (urlRepo) {
			setSelectedName({ value: urlRepo, label: urlRepo });
		}
		if (urlDate) {
			setSelectedMetric({ value: urlDate, label: urlDate });
		}

		if (platform) {
			if (platforms.includes(platform as string)) {
				setSelectedPlatform({ value: platform, label: platform });
			} else {
				setSelectedPlatform({ value: platforms[0], label: platforms[0] });
				if (platform !== true) {
					alert(`Invalid platform: ${platform}`);
				}
			}
		} else {
			setSelectedPlatform({ value: platforms[0], label: platforms[0] });
		}
	}, []);

	const getAdjacentRepo = (repo) => {
		const currentRepoIndex = repoList.findIndex((r) => r.name === repo.value);
		const currentRepo = [repoList[currentRepoIndex]].map((r) => ({
			platform: r.platform,
			name: r.name,
			image: `https://avatars.githubusercontent.com/u/${r.id}`,
		}));
		const previousTwoRepoIndexes = [currentRepoIndex - 2, currentRepoIndex - 1];
		const previousTwoRepos = previousTwoRepoIndexes
			.map((index) =>
				index >= 0 ? repoList[index] : repoList[repoList.length + index]
			)
			.map((r) => ({
				platform: r.platform,
				name: r.name,
				image: `https://avatars.githubusercontent.com/u/${r.id}`,
			}));
		const nextTwoRepoIndexes = [currentRepoIndex + 1, currentRepoIndex + 2];
		const nextTwoRepos = nextTwoRepoIndexes
			.map((index) =>
				index < repoList.length
					? repoList[index]
					: repoList[index - repoList.length]
			)
			.map((r) => ({
				platform: r.platform,
				name: r.name,
				image: `https://avatars.githubusercontent.com/u/${r.id}`,
			}));
		const result = [...previousTwoRepos, ...currentRepo, ...nextTwoRepos];
		setAdjacentRepo(result);
	};

	useEffect(() => {
		if (!selectedPlatform || !selectedType) return;
		const options = [];
		const list = selectedType.value === "Repo" ? repoList : userList;
		for (const r of list) {
			if (r.platform === selectedPlatform.value.toLowerCase()) {
				if (searchInputValue) {
					if (r.name.toLowerCase().includes(searchInputValue.toLowerCase())) {
						options.push({ value: r.name, label: r.name });
					}
				} else {
					options.push({ value: r.name, label: r.name });
				}
			}
			if (options.length >= optionsLimitCount) break;
		}
		setSelectOptions(options);
	}, [selectedPlatform, selectedType, repoList, userList, searchInputValue]);

	useEffect(() => {
		if (!selectedType) return;
		const map =
			selectedType.value === "Repo" ? repoMetricOptionMap : userMetricOptionMap;
		const options = [...map.entries()].map((m) => ({
			value: m[1],
			label: m[0],
		}));
		setMetricOptions(options);
		setSelectedMetric({ value: "openrank", label: "OpenRank" });
	}, [selectedType]);

  const prevRepo = () => {
    const currentRepoIndex = repoList.findIndex((r) => r.name === selectedName.value);
    const previousRepoIndex = currentRepoIndex - 1;
    const previousRepo = previousRepoIndex >= 0 ? repoList[previousRepoIndex] : repoList[repoList.length - 1];
    setSelectedName({ value: previousRepo.name, label: previousRepo.name });
    getAdjacentRepo({ value: previousRepo.name, label: previousRepo.name });
  }

  const nextRepo = () => {
    const currentRepoIndex = repoList.findIndex((r) => r.name === selectedName.value);
    const nextRepoIndex = currentRepoIndex + 1;
    const nextRepo = nextRepoIndex < repoList.length ? repoList[nextRepoIndex] : repoList[0];
    setSelectedName({ value: nextRepo.name, label: nextRepo.name });
    getAdjacentRepo({ value: nextRepo.name, label: nextRepo.name });
  }

	return (
		<div style={{ position: "relative" }}>
			{!(
				(platform && platforms.includes(platform as string)) ||
				platform === true
			) && (
				<Select
					options={platforms.map((p) => ({ value: p, label: p }))}
					value={selectedPlatform}
					onChange={(selectedOption) => {
						setSelectedPlatform(selectedOption);
						setSelectedName(null);
					}}
					isSearchable={false}
					isClearable={false}
					styles={selectStyles("120px")}
				/>
			)}
			{!((type && types.includes(type as string)) || type === true) && (
				<Select
					options={types.map((p) => ({ value: p, label: p }))}
					value={selectedType}
					onChange={(selectedOption) => {
						setSelectedType(selectedOption);
						setSelectedName(null);
					}}
					isSearchable={false}
					isClearable={false}
					styles={selectStyles("100px")}
				/>
			)}
			<Select
				options={selectOptions}
				value={selectedName}
				inputValue={searchInputValue}
				onInputChange={setSearchInputvalue}
				onChange={(selectedOption) => {
					setSelectedName(selectedOption);
					setSearchInputvalue("");
					getAdjacentRepo(selectedOption);
				}}
				placeholder={translate({ id: "searchInput.placeholder" })}
				isClearable
				styles={selectStyles("300px")}
			/>
			{!metric && (
				<Select
					options={metricOptions}
					value={selectedMetric}
					onChange={(selectedOption) => {
						setSelectedMetric(selectedOption);
					}}
					isSearchable={false}
					isClearable={false}
					styles={selectStyles("200px")}
				/>
			)}
			<button
				style={submitStyles}
				onClick={() => {
					onSubmit &&
						onSubmit({
							platform: selectedPlatform?.value,
							type: selectedType?.value,
							name: selectedName?.value,
							metric: selectedMetric?.value,
							metricDisplayName: selectedMetric?.label,
						});
				}}
			>
				{translate({ id: "searchInput.submit" })}
			</button>
			<div style={{ position: "absolute", top: "75px" }}>
				{adjacentRepo.length > 0 && type && (
					<div style={{ position: "relative" }}>
						<button
							style={{
								position: "absolute",
								left: "-20px",
								top: "50%",
								transform: "translateY(-50%) translateX(-1rem)",
								backgroundColor: "white",
								padding: "0.5rem",
								borderRadius: "9999px",
								border: "none",
								boxShadow:
									"0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
								transition: "background-color 200ms",
								outline: "none",
								cursor: "pointer",
							}}
              onClick={prevRepo}
						>
							<ChevronLeft size={24} />
						</button>

						<div
							style={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								gap: "10px",
							}}
						>
							{adjacentRepo.map((repo, index) => (
								<ImageCard key={index} repo={repo} />
							))}
						</div>

						<button
							style={{
								position: "absolute",
								right: "-20px",
								top: "50%",
								transform: "translateY(-50%) translateX(1rem)",
								backgroundColor: "white",
								padding: "0.5rem",
								borderRadius: "9999px",
								border: "none",
								boxShadow:
									"0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
								transition: "background-color 200ms",
								outline: "none",
								cursor: "pointer",
							}}
              onClick={nextRepo}
						>
							<ChevronRight size={24} />
						</button>
					</div>
				)}
			</div>
		</div>
	);
};
