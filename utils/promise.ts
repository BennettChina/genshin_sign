import * as api from "./api";
import {cookies} from "../init";
import {Cookies} from "../module/cookies";
import {SignResult, UserGameRolesData} from "#/genshin_sign/utils/resultObjectType";

export enum ErrorMsg {
	NOT_FOUND = "未查询到角色数据，请检查米哈游通行证（非UID）是否有误或是否设置角色信息公开",
	UNKNOWN = "发生未知错误",
	FORM_MESSAGE = "米游社接口报错: "
}

/**
 * 进行签到
 * @param uid
 * @param region
 * @param cookie
 */
export async function signPromise( uid: string, region: string, cookie: string): Promise<object> {
	const { retcode, message, data } = await api.sign( uid, region, cookie ? cookie : cookies.get() );
	
	return new Promise( async ( resolve, reject ) => {
		if ( retcode === -100 ) {
			reject( Cookies.checkExpired( cookie ) );
			return;
		}
		if ( retcode !== 0 ) {
			reject( `米游社接口报错: ${ message }` );
			return;
		}
		if ( data.gt || data.success !== 0 ) {
			reject( "遇到验证码拦截，签到失败，请自行手动签到" );
			return;
		}
		resolve( data );
	} );
}

/**
 * 获取签到信息
 * @param uid
 * @param region
 * @param cookie
 */
export async function hasSignPromise( uid: string, region: string, cookie: string): Promise<SignResult> {
	const { retcode, message, data } = await api.getHasSign( uid, region, cookie ? cookie : cookies.get() );
	
	return new Promise( async ( resolve, reject ) => {
		if ( retcode === -100 ) {
			reject( Cookies.checkExpired( cookie ) );
			return;
		}
		if ( retcode !== 0 ) {
			reject( `米游社接口报错: ${ message }` );
			return;
		}

		resolve( data );
	} );
}

/**
 * 获取角色数据
 * @param cookie
 */
export async function userGameRolesPromise(cookie: string): Promise<UserGameRolesData[]> {
	const { retcode, message, data } = await api.getUserGameRolesByCookie( cookie ? cookie : cookies.get() );
	
	return new Promise( async ( resolve, reject ) => {
		if ( retcode === -100 ) {
			reject( Cookies.checkExpired( cookie ) );
			return;
		} else if ( retcode !== 0 ) {
			reject( `米游社接口报错: ${ message }` );
			return;
		} else if ( !data.list || data.list.length === 0 ) {
			reject( "未查询到绑定账号信息，请检查米哈游通行证（非UID）是否有误或是否有绑定账号" );
			return;
		}
		resolve( data.list );
	} );
}
