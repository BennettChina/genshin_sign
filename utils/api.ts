import {getDS2} from "./ds";
import {register} from "@/utils/request";
import {getMiHoYoUuid} from "#/mihoyo-login/util/utils";
import {getDeviceFp} from "#/genshin_sign/utils/index";


const __API = {
	FETCH_HAS_BIND_ACCOUNT: "https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByCookie",//米有社 绑定角色信息
	// FECH_HAS_SIGN: "https://api-takumi.mihoyo.com/event/bbs_sign_reward/info",//查询签到信息
	FECH_HAS_SIGN: "https://api-takumi.mihoyo.com/event/luna/info",//查询签到信息
	// FECH_SIGN: "https://api-takumi.mihoyo.com/event/bbs_sign_reward/sign",//签到
	FECH_SIGN: "https://api-takumi.mihoyo.com/event/luna/sign",//签到
};


const HEADERS2 = {
	// "User-Agent": "Mozilla/5.0 (Linux; Android 5.1.1; f103 Build/LYZ28N; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/52.0.2743.100 Safari/537.36 miHoYoBBS/2.34.1",
	// "Referer": "https://webstatic.mihoyo.com/bbs/event/signin-ys/index.html?bbs_auth_required=true&act_id=e202009291139501&utm_source=bbs&utm_medium=mys&utm_campaign=icon",
	// "Accept-Encoding": "gzip, deflate,br",
	"x-rpc-app_version": "2.70.1",
	"x-rpc-client_type": 5,
	"x-rpc-device_id": guid(),
	// "DS": ""
	"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/2.70.1",
	"Referer": "https://act.mihoyo.com/",
	"Accept-Encoding": "gzip, deflate, br",
	"Connection": "keep-alive",
	"x-rpc-signgame": "hk4e",
	"Accept": "application/json, text/plain, */*",
	"Accept-Language": "zh-CN,zh-Hans;q=0.9",
	"Host": "api-takumi.mihoyo.com",
	"Origin": "https://act.mihoyo.com",
};

const { request: $https } = register( {
	timeout: 60000,
	responseType: "json",
}, __API );

function guid() {
	function S4() {
		return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	}
	return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}



/**
 * 签到
 * @param uid
 * @param region
 * @param cookie
 */
export async function sign( uid: number, region: string, cookie: string ): Promise<any> {
	const body = {
		act_id: 'e202311201442471',
		uid: uid,
		region: region,
		lang:"zh-cn"
	};
	const deviceId = getMiHoYoUuid();
	const deviceFp = await getDeviceFp( deviceId );

	return new Promise( ( resolve, reject ) => {
		$https.FECH_SIGN.post(body,{
			headers: {
				...HEADERS2,
				"Cookie": cookie,
				"content-type": "application/json;charset=utf-8",
				"x-rpc-platform": 1,
				"x-rpc-device_fp": deviceFp,
				"x-rpc-device_id": deviceId,
				"DS": getDS2()
			}
		})
			.then( ( result ) => {
				resolve( result.data );
			} )
			.catch( ( reason ) => {
				reject( reason );
			} );
	} );
}

/**
 * 是否签到
 * @param uid
 * @param region
 * @param cookie
 */
export async function getHasSign( uid: number, region: string, cookie: string ): Promise<any> {
	const query = { act_id: "e202311201442471", region: region, uid: uid,lang:"zh-cn" };
	return new Promise( ( resolve, reject ) => {
		$https.FECH_HAS_SIGN.get(query,{
			headers: {
				...HEADERS2,
				"Cookie": cookie
			}
		})
			.then( ( result ) => {
				resolve( result.data );
			} )
			.catch( ( reason ) => {
				reject( reason );
			} );
	} );
}

/**
 * 角色信息
 * @param cookie
 */
export async function getUserGameRolesByCookie( cookie: string ): Promise<any> {
	const query = { game_biz: "hk4e_cn" };
	return new Promise( ( resolve, reject ) => {
		$https.FETCH_HAS_BIND_ACCOUNT.get(query,
			{
			headers: {
			...HEADERS2,
				Cookie: cookie
		}})
			.then( ( result ) => {
				resolve( result.data );
			} )
			.catch( ( reason ) => {
				reject( reason );
			} );
	} );
}
