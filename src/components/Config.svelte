<script>
  import { apiKey, selectedVoice, voices } from "../lib/db";

  let configElement;
  let apiKeyInput = $apiKey;
  let voiceInput = $selectedVoice;

  function updateConfig(close) {
    if ($apiKey !== apiKeyInput) {
      $apiKey = apiKeyInput;
    }
    $selectedVoice = voiceInput;
    if (close && configElement) {
      configElement.open = false;
    }
  }
</script>

<details
  bind:this={configElement}
  class="config-box"
  on:toggle={() => updateConfig(false)}
  open={!$apiKey}
>
  <summary>Configuration</summary>
  <div class="config">
    <label class="field">
      <div>WaniKani API key (v2):</div>
      <input class="input" type="text" bind:value={apiKeyInput} />
    </label>
    {#if $voices.length > 0}
      <label class="field">
        <div>Voice:</div>
        <select class="input" bind:value={voiceInput}>
          {#each $voices as voice}
            <option value={voice.id}>
              {voice.name}
            </option>
          {/each}
        </select>
      </label>
    {/if}
    <div class="field">
      <button on:click={() => updateConfig(true)}>Save</button>
    </div>
  </div>
</details>

<style>
  .config-box {
    border: solid 1px #ccc;
    border-radius: 1rem;
  }

  .config-box summary {
    padding: 1rem;
    cursor: pointer;
  }

  .config {
    padding: 1rem;
    padding-top: 0;
  }

  .config .field {
    display: flex;
    align-items: baseline;
  }

  .config .field:not(:first-child) {
    padding-top: 1rem;
  }

  .config .field .input {
    flex: 1 1 auto;
    padding: 0.5rem;
    margin-left: 1rem;
  }

  .config button {
    padding: 0.5rem 1rem;
    background-color: #0099ffc0;
    color: #fff;
    font-size: 1rem;
    border: 0;
    border-radius: 0.5rem;
    cursor: pointer;
  }

  .config button:hover {
    background-color: #0099ff;
  }

  @media (max-width: 768px) {
    .config .field {
      flex-direction: column;
      align-items: stretch;
    }

    .config .field .input {
      margin-left: 0;
      margin-top: 0.5rem;
    }
  }
</style>
