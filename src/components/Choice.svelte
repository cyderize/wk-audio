<script>
  import { createEventDispatcher } from "svelte";

  /** @type {boolean} */
  export let correct;
  /** @type {string} */
  export let label;
  /** @type {string | null} */
  export let selectedLabel = null;
  export let disabled = false;

  const dispatch = createEventDispatcher();

  let selected = false;

  function reset(correct, label, selectedLabel) {
    selected = false;
  }

  $: reset(correct, label, selectedLabel);

  function select() {
    if (!disabled && !selected) {
      selected = true;
      dispatch("select");
    }
  }
</script>

<button
  type="button"
  class="button choice"
  class:correct={correct && selected}
  class:incorrect={!correct && selected}
  on:click={select}
>
  {selected ? selectedLabel || label : label}
</button>

<style>
  .choice {
    padding: 1rem;
    font-size: 1rem;
    white-space: wrap;
  }
  .correct {
    background-color: rgb(33, 190, 60);
    color: #fff;
  }
  .incorrect {
    background-color: rgb(197, 51, 51);
    color: #fff;
  }
</style>
