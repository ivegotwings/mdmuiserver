const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<style>
  :host &gt; * {
    --pebble-data-table: {
      font: 400 100%/1.5 Roboto, sans-serif;
      font-size: 13px;
      font-weight: 400;
      line-height: 1.1;
      color: rgba(0, 0, 0, 0.87);
    };

    --pebble-data-table-header: {
      background-color: #fafafa;
      color: rgba(0, 0, 0, 0.54);
      font-size: 12px;
      font-weight: 600;
      height: 56px;
    };

    --pebble-data-table-row: {
      border-bottom: 1px solid #e3e3e3;
    };

    --pebble-data-table-row-hover: {
      background-color: #eee;
    };

    --pebble-data-table-row-selected: {
      color: var(--default-primary-color, #03A9FA);
    };

    --pebble-data-table-row-after: {
      background-color: var(--default-primary-color, #03A9F4);
      bottom: 0;
      content: "";
      height: 2px;
      left: 0;
      pointer-events: none;
      position: absolute;
      right: 0;
      transition: all 0.16s ease-in-out;

      -webkit-transform: scaleX(0.0);
      transform: scaleX(0.0);
      z-index: 1;
    };

    --pebble-data-table-row-focused: {
      background-color: #eee;
    };

    --pebble-data-table-row-focused-after: {
      -webkit-transform: scaleX(1.0);
      transform: scaleX(1.0);
    };
  }
</style>`;

document.head.appendChild($_documentContainer.content);
