<script lang="ts">
	import { connectWallet, getTreeState, getUserTrees, mintTree, waterTree } from '$lib/contract/web3';
	import { onMount } from 'svelte';

	let userAddress: string | null = null;
	let errorMsg: string | null = null;

	let userTrees:bigint
	let treeStates = []

	async function loadTrees() {
		try {
			userTrees = await getUserTrees()
			const states = [];
			for (let id = 1n; id <= userTrees; id++) {
				const state = await getTreeState(id);
				states.push({ tokenId: id, state });
			}
			treeStates = states;
		} catch (err) {
			console.error('Ошибка при загрузке состояний деревьев:', err);
		}
	}

	async function handleWaterTree(tokenId: bigint) {
		try {
			await waterTree(tokenId)
			await loadTrees()
		} catch (err) {
			console.log(err)
			errorMsg = 'Упс, не удалось подключить кошелёк.';
		}
	}

	async function handleConnect() {
		try {
			const { signer } = await connectWallet();
			userAddress = await signer.getAddress();
			errorMsg = null;
			await loadTrees()
		} catch (err) {
			errorMsg = 'Упс, не удалось подключить кошелёк.';
		}
	}

	let isMinting = false;
	let feedbackMsg = '';

	async function handleMint() {
		try {
			// Убедимся, что кошелёк подключен
			await connectWallet();
			isMinting = true;
			// Допустим, у контракта есть метод mintTree()
			await mintTree()
			await loadTrees()
		} catch (err) {
			console.log(err)
			feedbackMsg = 'Ох, что-то пошло не так при посадке дерева.';
		} finally {
			isMinting = false;
		}
	}
</script>

<style lang="scss">
    .hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        background: linear-gradient(180deg, #E8FFB3 0%, #00D4C2 100%);
        height: 100svh;

        font-family: Inter, sans-serif;

				h1 {
            font-size: 2.5em;
            font-weight: 700;
            text-align: center;
            text-underline-position: from-font;
            text-decoration-skip-ink: none;
        }

				p {
						font-size: 1.2em;
            font-weight: 400;
            text-align: start;
            text-underline-position: from-font;
            text-decoration-skip-ink: none;
						max-width: 800px;
        }
    }

    .gallery {
			display: flex;
			gap: 1rem;
			flex-wrap: wrap;
    }
    .tree-card {
			border: 1px solid #fff;
			padding: 1rem;

			width: 282px;
			height: 282px;
			border-radius: 30px;
			background-color: #fff;

      img {
        height: 100%;
        object-fit: contain; /* Убедиться, что изображение вписывается внутрь */
      }
    }
		.action-button {
      position: relative;
			width: 269.23px;
			height: 47.02px;
			border-radius: 50px;
			border-color: transparent;
			background: #2551FF;

			font-family: Inter, sans-serif;
			font-size: 24px;
			font-weight: 700;
			color: white;
    }
</style>

<div class="hero">
	<h1>🌳 Grow Your Digital Tree!</h1>
	<p>
		Blending art, blockchain, and ecology, Digital Tree NFT is a project that connects you to the planet in a unique way. Nurture a digital tree, watch it grow, and mint it as a symbol of your commitment to a sustainable future.
	</p>
	<h2>🌍 Together, let’s inspire change and grow a greener tomorrow!</h2>

	{#if userAddress}
		<p>Ваш кошелёк: {userAddress}</p>

		<h2>Посадить своё деревце</h2>
		{#if feedbackMsg}
			<p>{feedbackMsg}</p>
		{/if}
		<button on:click={handleMint} disabled={isMinting} class="action-button">
			{isMinting ? '🌱 Planting...' : '🌱 Plant a Tree'}
		</button>

		<h2>Мои деревья</h2>
		<div class="gallery">
			{#each treeStates as t}
				<div class="tree-card">
					<img src="/good.png" alt="good condition">
					<button on:click={handleWaterTree(t.tokenId)} class="action-button" style="margin-top: -0.5em;">mint</button>
					<p>Token ID: {t.tokenId}</p>
					<p>Состояние: {t.state}</p>
					<!-- Тут можно отобразить анимацию или иконку в зависимости от t.state -->
				</div>
			{/each}
		</div>
	{:else}
		<button on:click={handleConnect} class="action-button">connect wallet</button>
	{/if}

	{#if errorMsg}
		<p style="color: red;">{errorMsg}</p>
	{/if}
</div>
