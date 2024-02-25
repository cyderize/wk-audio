<script>
  /** @typedef {import('../lib/db').Subject} Subject */
  /** @type {Subject} */
  export let subject;
</script>

<div class={`tile srs-${subject.srsStage}`}>
  {subject.characters}
</div>

<style>
  .tile {
    padding: 0.1rem 0.3rem;
    border: solid 1px var(--border-color);
    border-radius: 5px;
  }

  .srs-1 {
    background-color: rgb(255, 212, 235);
  }
  .srs-2 {
    background-color: rgb(255, 193, 226);
  }
  .srs-3 {
    background-color: rgb(255, 167, 214);
  }
  .srs-4 {
    background-color: rgb(255, 144, 203);
  }
  .srs-5 {
    background-color: rgb(229, 189, 255);
  }
  .srs-6 {
    background-color: rgb(218, 161, 255);
  }
  .srs-7 {
    background-color: rgb(161, 194, 255);
  }
  .srs-8 {
    background-color: rgb(193, 227, 255);
  }
  .srs-9 {
    background-color: rgb(255, 227, 174);
  }

  @media (prefers-color-scheme: dark) {
    .srs-1 {
      background-color: rgb(51, 30, 42);
    }
    .srs-2 {
      background-color: rgb(80, 36, 59);
    }
    .srs-3 {
      background-color: rgb(119, 26, 76);
    }
    .srs-4 {
      background-color: rgb(148, 27, 91);
    }
    .srs-5 {
      background-color: rgb(58, 41, 70);
    }
    .srs-6 {
      background-color: rgb(68, 21, 99);
    }
    .srs-7 {
      background-color: rgb(43, 54, 75);
    }
    .srs-8 {
      background-color: rgb(15, 56, 90);
    }
    .srs-9 {
      background-color: rgb(102, 74, 24);
    }
  }
</style>
