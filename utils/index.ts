import {
	accelerometer,
	batteryStatus,
	deviceFp,
	getMiHoYoRandomStr,
	getMiHoYoUuid,
	magnetometer,
	randomInt
} from "#/mihoyo-login/util/utils";
import axios from "axios";

enum Api {
	mihoyo_login_qrcode_creat = "https://hk4e-sdk.mihoyo.com/hk4e_cn/combo/panda/qrcode/fetch",
	mihoyo_login_qrcode_query = "https://hk4e-sdk.mihoyo.com/hk4e_cn/combo/panda/qrcode/query",
	mihoyo_token = "https://passport-api.mihoyo.com/account/ma-cn-session/app/getTokenByGameToken",
	mihoyo_cookie = "https://api-takumi.mihoyo.com/auth/api/getCookieAccountInfoByGameToken",
	getFp = "https://public-data-api.mihoyo.com/device-fp/api/getFp"
}

/**
 * 异步获取设备指纹
 * @param deviceId
 */
export async function getDeviceFp( deviceId: string ): Promise<string> {
	// platform=1 的拓展字段
	const status = batteryStatus();
	const ext_fields = {
		IDFV: getMiHoYoUuid().toUpperCase(),
		model: 'iPhone16,1',
		osVersion: '17.0.3',
		screenSize: '393×852',
		vendor: '--',
		cpuType: 'CPU_TYPE_ARM64',
		cpuCores: '16',
		isJailBreak: '0',
		networkType: 'WIFI',
		proxyStatus: '0',
		batteryStatus: status.toString( 10 ),
		chargeStatus: status > 30 ? '0' : '1',
		romCapacity: `${ randomInt( 100000, 500000 ) }`,
		romRemain: '129536',
		ramCapacity: `${ randomInt( 1000, 10000 ) }`,
		ramRemain: '8024',
		appMemory: `${ randomInt( 50, 110 ) }`,
		accelerometer: accelerometer().join( 'x' ),
		gyroscope: accelerometer().join( 'x' ),
		magnetometer: magnetometer().join( 'x' )
	};
	const response = await axios.post( Api.getFp, {
		seed_id: getMiHoYoRandomStr( 13 ),
		device_id: deviceId,
		platform: '1',
		seed_time: new Date().getTime() + '',
		ext_fields: JSON.stringify( ext_fields ),
		app_name: 'bbs_cn',
		device_fp: deviceFp()
	} );
	
	const data = response.data;
	if ( data.retcode !== 0 ) {
		return Promise.reject( data.message );
	}
	
	if ( data.data.code !== 200 ) {
		return Promise.reject( data.data.msg );
	}
	
	return data.data.device_fp;
}
