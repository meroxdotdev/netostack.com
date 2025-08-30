<script lang="ts">
	import '../styles/base.scss';
	import '../styles/variables.scss';
	import '../styles/components.scss';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
