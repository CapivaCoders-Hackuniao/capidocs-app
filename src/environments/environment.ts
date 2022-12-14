// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
	production: true,
	blockchainNode: "https://celo-alfajores.infura.io/v3/4914a0f028a14bdeaf29df3a588aad2f",
	docsList: [
		"Prova de nome",
		"Prova de aniversário",
		"prova de residência",
		"Prova de renda",
		"Certificado de nacimento",
		"Numero de sugrança social",
		"Registro de cidadão",
		"Lincença de motoritas",
		"Registro de firma",
		"Passaporte",
		"Certificado de incorporação",
		"Memorando de associação",
		"Estatuto Social",
		"Certidão de casamento",
		"Certidão de óbito",
		"Registro de política",
		"escritura de propriedade",
	],
	// Voltar ao normal o outro que está comentado e apagar esse
	registryAddress: "0x113767e9386fcd391d2eb07997cff4e671809bd1",
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
