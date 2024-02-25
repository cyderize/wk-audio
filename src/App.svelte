<script>
  import Config from "./components/Config.svelte";
  import Tile from "./components/Tile.svelte";
  import Quiz from "./components/Quiz.svelte";
  import { apiKey, currentSubjectsByLevel } from "./lib/db";

  /** @type {number | null} */
  let quizLevel = null;
</script>

<main>
  {#if quizLevel === null}
    <Config />
    <section class="content">
      {#if $apiKey && Object.keys($currentSubjectsByLevel).length === 0}
        <div class="loader">
          <div class="lds-ring">
            <div />
            <div />
            <div />
            <div />
          </div>
        </div>
      {/if}
      {#each Object.keys($currentSubjectsByLevel) as level}
        <div class="level">
          <div class="heading">
            <h3>Level {level}</h3>
            <button
              type="button"
              class="button quiz-button"
              on:click={() => (quizLevel = level)}>Quiz</button
            >
          </div>
          <div class="tiles">
            {#each $currentSubjectsByLevel[level] as subject}
              <Tile {subject} />
            {/each}
          </div>
        </div>
      {/each}
    </section>
  {:else}
    <Quiz
      subjects={$currentSubjectsByLevel[quizLevel]}
      on:close={() => (quizLevel = null)}
    />
  {/if}
</main>

<style>
  main {
    max-width: 1200px;
    margin: 0 auto;
  }

  .content {
    padding-top: 1rem;
  }

  .level {
    padding: 0.5rem 0;
  }

  .level .heading {
    display: flex;
    gap: 1rem;
  }

  .quiz-button {
    padding: 0.25rem 0.4rem;
  }

  .tiles {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }

  .loader {
    text-align: center;
    padding: 2rem;
  }
</style>
