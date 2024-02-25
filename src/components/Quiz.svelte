<script>
  import { createEventDispatcher } from "svelte";
  import { selectedVoice, subjects as allSubjects } from "../lib/db";
  import { chooseRandom, shuffle } from "../lib/util";
  import Choice from "./Choice.svelte";
  import Statistics from "./Statistics.svelte";

  const dispatch = createEventDispatcher();

  /** @typedef {import('../lib/db').Subject} Subject */
  /** @type {Subject[]} */
  export let subjects;

  /** @type {HTMLAudioElement} */
  let audioElement;

  /**
   * @typedef {Object} Question
   * @property {string} audio
   * @property {string} reading
   * @property {string} meaning
   * @property {string[]} otherMeanings
   * @property {string[]} choices
   * @property {string} characters
   */

  /** @type {Question[]} */
  let questions = [];
  let currentIndex = 0;
  let showNext = false;
  let correct = 0;
  let incorrect = 0;

  let wasIncorrect = false;

  /**
   * @param subjects {Subject[]}
   */
  function generate(subjects) {
    questions = shuffle(subjects).map((subject) => {
      const audio =
        subject.audio.find((item) => item.voiceId === $selectedVoice) ||
        subject.audio[0];
      const choices = generateChoices(
        audio.kana,
        subject.meaning,
        subject.otherMeanings,
      );
      return {
        audio: audio.url,
        reading: audio.kana,
        meaning: subject.meaning,
        otherMeanings: subject.otherMeanings,
        choices,
        characters: subject.characters,
      };
    });
    currentIndex = 0;
    showNext = false;
    correct = 0;
    incorrect = 0;
  }

  function generateChoices(reading, meaning, otherMeanings) {
    const choices = [meaning];
    for (let i = 0; choices.length < 5 && i < 20; i++) {
      const other = chooseRandom(Object.values($allSubjects));
      if (
        choices.some((c) => c.label === other.meaning) ||
        otherMeanings.indexOf(other.meaning) !== -1 ||
        other.otherMeanings.some(
          (m) => m === meaning || otherMeanings.indexOf(m) !== -1,
        ) ||
        other.readings.indexOf(reading) !== -1
      ) {
        continue;
      }
      choices.push(other.meaning);
    }
    return shuffle(choices);
  }

  $: generate(subjects);

  function nextQuestion() {
    currentIndex++;
    showNext = false;
    wasIncorrect = false;
  }

  $: current =
    questions && currentIndex < questions.length
      ? questions[currentIndex]
      : null;
</script>

<div class="container">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="exit" on:click={() => dispatch("close")}>×</div>
  {#if current}
    <div class="top">
      <audio bind:this={audioElement} src={current.audio} autoplay />
      <button
        type="button"
        class="button play-audio"
        on:click={() => audioElement.play()}
      >
        🔊
      </button>
      <Statistics
        {correct}
        {incorrect}
        remaining={questions.length - currentIndex}
      />
    </div>
    <div class="choices">
      {#each current.choices as choice}
        <Choice
          label={choice}
          correct={choice === current.meaning}
          selectedLabel={choice === current.meaning ? current.characters : null}
          disabled={showNext}
          on:select={() => {
            if (choice === current.meaning) {
              showNext = true;
              correct++;
            } else if (!wasIncorrect) {
              wasIncorrect = true;
              questions = [
                ...questions,
                {
                  ...current,
                  choices: generateChoices(
                    current.reading,
                    current.meaning,
                    current.otherMeanings,
                  ),
                },
              ];
              incorrect++;
            }
          }}
        />
      {/each}
    </div>

    <div class="bottom">
      <button
        type="button"
        class="next-button primary button"
        on:click={nextQuestion}
        disabled={!showNext}
        >Next Question ▶
      </button>
    </div>
  {:else if correct + incorrect > 0}
    <div class="done">
      <div>
        <div class="message">Quiz complete!</div>
        <div>You scored:</div>
        <div class="score">
          {Math.round((100 * correct) / (correct + incorrect))}%
        </div>
        <div>
          <button
            class="primary button back"
            type="button"
            on:click={() => dispatch("close")}
          >
            Back to menu
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .container {
    position: relative;
  }
  .top {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding-bottom: 1rem;
  }
  .play-audio {
    padding: 1rem;
    font-size: 2rem;
  }
  .choices {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  .bottom {
    padding-top: 1rem;
  }
  .next-button {
    font-size: 1rem;
    padding: 1rem 2rem;
    margin: 0 auto;
    display: block;
    transition: background-color 0.2s ease;
  }
  .done {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
  }

  .done .message {
    font-size: 2rem;
    padding-bottom: 2rem;
  }

  .done .score {
    font-size: 4rem;
  }

  .done .back {
    margin-top: 2rem;
    padding: 0.75rem 1.5rem;
    border-radius: 1rem;
    font-size: 1rem;
  }
</style>
