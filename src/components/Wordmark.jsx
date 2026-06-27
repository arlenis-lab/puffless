/**
 * Puffless wordmark.
 * "puff" → weight 300, "--text"
 * "less" → weight 700, "--accent"
 *
 * @param {{ size?: number|string }} props
 */
export default function Wordmark({ size = 28 }) {
  return (
    <span className="wordmark" style={{ fontSize: size }}>
      <span className="wordmark-puff">puff</span>
      <span className="wordmark-less">less</span>
    </span>
  )
}
