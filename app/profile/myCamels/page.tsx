import Nav from "@/components/Navigation/Nav"
import RegisterCamelsUsers from "@/components/Tabels/RegisteredCamelsUsers"

const page = () => {
  return (
    <div>
        <Nav/>
        <div>
            <RegisterCamelsUsers />
        </div>
    </div>
  )
}

export default page