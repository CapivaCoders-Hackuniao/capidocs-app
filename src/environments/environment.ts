// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
	production: true,
	blockchainNode: "https://mainnet.mustblockchain.com",
	docsList: [
		"Proof of name",
		"Proof of birthday",
		"Proof of residency",
		"Proof of Income",
		"Birth certificate",
		"Social Security number",
		"Citizen registry",
		"Driver license",
		"Company Registry",
		"Passport",
		"Certificate of incorporation",
		"Memorandum of association",
		"Articles of association",
		"Marriage certificate",
		"Death certificate",
		"Policy registry",
		"Property deed",
	],
	// Voltar ao normal o outro que está comentado e apagar esse
	registryAddress: "0xcEb2CE6b5BB38F10D8c65C3516A1978E52900200",
	scryptDiff: 14,

	// registryAddress: '0x39c3dE0AFd220A2e2c4ccc8515bb544ee83E8e7C',
	// scryptDiff: 14, // PELOAMORDEDEUS amenta isso pra mais de 14 em PROD senão a wallet fica fácil de quebrar
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import "zone.js/dist/zone-error"; // Included with Angular CLI.
