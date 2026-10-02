// "Apply now" button used on position cards and in the details popup. Opens the Apply page
// with this position already selected.
import { useNavigate } from 'react-router-dom'

export function ApplyButton({ positionId, block }: { positionId: number; block?: boolean }) {
  const navigate = useNavigate()
  return (
    <button
      className={`btn btn-primary ${block ? 'btn-block' : ''}`}
      onClick={(e) => {
        e.stopPropagation() // don't also open the details popup when clicked on a card
        navigate(`/apply?position=${positionId}`)
      }}
    >
      Apply now
    </button>
  )
}
