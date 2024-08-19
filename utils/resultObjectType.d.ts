
export type SignResult = {
	// 签到天数
	total_sign_day: string,
	// 签到总天数
	today: string,
	// 签到状态
	is_sign: boolean,
	// 漏掉签到
	"sign_cnt_missed": number,
	first_bind: boolean
};

export type UserGameRolesData = {
	// 区服
	region: "cn_gf01"|"cn_qd01",
	game_biz: string,
	game_uid: string,
	nickname: string,
	level: number,
	is_chosen: string,
	region_name: string,
	is_official: string
};