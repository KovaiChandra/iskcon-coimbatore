/** Re-mounted on every page change, so each page fades up into place (.page-enter in globals.css). */
export default function Template({ children }) {
  return <div className="page-enter">{children}</div>
}
