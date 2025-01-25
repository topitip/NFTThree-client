import {
	createThirdwebClient,
	getContract,
	prepareContractCall,
	sendTransaction,
	readContract,
} from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { BrowserProvider } from 'ethers';

let provider: BrowserProvider;
let signer: any;
export let client;
export let contract;

export async function connectWallet() {
	if (typeof window.ethereum !== 'undefined') {
		try {
			await window.ethereum.request({ method: 'eth_requestAccounts' });

			provider = new BrowserProvider(window.ethereum);
			signer = await provider.getSigner();
			client = createThirdwebClient({
				clientId: '95780d7492c59e980ae34836fb25bfcb',
			});
			contract = getContract({
				client,
				chain: defineChain(5003),
				address: "0x4028F6C8d822165D5F776B72451024Ec9Fc55706",
			});

			return { provider, signer, contract };
		} catch (err) {
			console.error('Ошибка при подключении кошелька:', err);
			throw err;
		}
	} else {
		alert('MetaMask не обнаружен. Установите расширение, чтобы продолжить.');
		throw new Error('MetaMask not found');
	}
}

export async function getTreeState(tokenId: bigint) {
	if (!contract) throw new Error('Контракт не инициализирован');
	const state = await readContract({
		contract,
		method:
			"function getTreeState(uint256 tokenId) view returns (uint8)",
		params: [tokenId],
	});
	return state;
}

export async function getUserTrees() {
	const state = await readContract({
		contract,
		method: 'function balanceOf(address owner) view returns (uint256)',
		params: [ signer.address ]
	});
	return state;
}

export async function mintTree() {
	if (!contract) throw new Error('Контракт не инициализирован');
	try {
		const transaction = await prepareContractCall({
			contract,
			method: "function mintTree() returns (uint256)",
			params: [],
		});
		// Вызываем метод mintTree из контракта
		const tx = await sendTransaction({
			transaction,
			account: signer,
		});
		console.log('Транзакция отправлена:', tx.hash);

		// Ждём завершения транзакции
		const receipt = await provider.waitForTransaction(tx.hash);
		console.log('Транзакция подтверждена:', receipt);

		// Получаем ID нового дерева (если контракт возвращает tokenId)
		const newTokenId = receipt; // Это зависит от вашего контракта
		console.log('Новое дерево посажено с токеном ID:', newTokenId);

		return newTokenId;
	} catch (err) {
		console.error('Ошибка при посадке дерева:', err);
		throw err;
	}
}


export async function waterTree(tokenId: number) {
	if (!contract) throw new Error('Контракт не инициализирован');
	try {
		const transaction = prepareContractCall({
			contract,
			method: 'function waterTree(uint256 tokenId)',
			params: [tokenId]
		});
		// Вызываем метод mintTree из контракта
		const tx = await sendTransaction({
			transaction,
			account: signer,
		});
		console.log('Транзакция отправлена:', tx.hash);

		// Ждём завершения транзакции
		const receipt = await provider.waitForTransaction(tx.hash);
		console.log('Транзакция подтверждена:', receipt);

		// Получаем ID нового дерева (если контракт возвращает tokenId)
		const newTokenId = receipt; // Это зависит от вашего контракта
		console.log('Дерево полито с токеном ID:', newTokenId);

		return newTokenId;
	} catch (err) {
		console.error('Ошибка при посадке дерева:', err);
		throw err;
	}
}
