<script lang="ts">
	import { connectWallet, getTreeState, getUserTrees, mintTree, waterTree } from '$lib/contract/web3';
	import { onMount } from 'svelte';

	let userAddress: string | null = null;
	let errorMsg: string | null = null;

	let userTrees:bigint
	let treeStates = []

	const Conditions = ['Good!', 'Neutral', 'Sadly']
	const ConditionImages = ['good', 'normal', 'bad']

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

	handleConnect()
</script>

<style lang="scss">
    .hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        background: linear-gradient(180deg, #E8FFB3 0%, #00D4C2 100%);
        min-height: 100svh;

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
			justify-content: space-around;
			gap: 1rem;
			flex-wrap: wrap;
    }

    .tree-card {
			border: 1px solid #fff;
			padding: 1rem;

			width: 282px;
			height: 282px;
      margin-bottom: 100px;
			border-radius: 30px;
			background-color: #fff;

			p {
				text-align: center;
        font-family: Inter, sans-serif;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 0;
				&:last-child {
          margin-top: 0;
				}
      }

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

      &:hover {
        background-color: #3b69ff; /* Изменение цвета при наведении */
        box-shadow: 0 4px 10px rgba(37, 81, 255, 0.5); /* Подсветка кнопки */
        transform: translateY(-2px); /* Небольшое поднятие кнопки */
      }

      &:active {
        transform: translateY(2px); /* Эффект нажатия кнопки */
        box-shadow: 0 2px 5px rgba(37, 81, 255, 0.3); /* Уменьшение тени при нажатии */
      }

      &:disabled {
        background-color: #d3d3d3;
        cursor: not-allowed;
        box-shadow: none;
        transform: none;
      }
    }
		.info {
			text-align: start;
      max-width: 800px;
      width: 100%;
		}
</style>

<div class="hero">
	<h1>🌳 Grow Your Digital Tree!</h1>
	<p>
		Blending art, blockchain, and ecology, Digital Tree NFT is a project that connects you to the planet in a unique way. Nurture a digital tree, watch it grow, and mint it as a symbol of your commitment to a sustainable future.
	</p>
	<h2>🌍 Together, let’s inspire change and grow a greener tomorrow!</h2>

	{#if userAddress}
		{#if feedbackMsg}
			<p>{feedbackMsg}</p>
		{/if}
		<button on:click={handleMint} disabled={isMinting} class="action-button" style="margin-bottom: 30px;">
			{isMinting ? '🌱 Planting...' : '🌱 Plant a Tree'}
		</button>

		<div class="gallery">
			{#each treeStates as t}
				<div class="tree-card">
					<img src={`/${ConditionImages[t.state]}.png`} alt="good condition">
					<button on:click={handleWaterTree(t.tokenId)} class="action-button" style="margin-top: -0.5em;">water the tree</button>
					<p>Token ID: {t.tokenId}</p>
					<p>Condition: {Conditions[t.state]}</p>
					<!-- Тут можно отобразить анимацию или иконку в зависимости от t.state -->
				</div>
			{/each}
		</div>
	{:else}
		<button on:click={handleConnect} class="action-button">connect wallet</button>
	{/if}

	<div class="info">
		<b>Why Digital Trees?</b>
		<p>In a world facing climate change, every action matters. Digital Tree NFT combines the power of blockchain and art to highlight the importance of taking care of our planet.</p>
	</div>

	<div class="info">
		<b>How It Works:</b>
		<ul>
			<li>🌱 Nurture a unique digital tree by "watering" it.</li>
			<li>🌍 Mint your tree as an NFT, symbolizing your commitment to ecology.</li>
			<li>💡 Share your tree and inspire others to care for nature.</li>
		</ul>
	</div>

	{#if errorMsg}
		<p style="color: red;">{errorMsg}</p>
	{/if}
</div>
