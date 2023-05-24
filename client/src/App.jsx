import RouterComponent from './RouterComponent'
import { UserContext, UserContextProvider } from './UserContext'



const App = () => {
    
    
    return (
        <UserContextProvider>
            <RouterComponent />
        </UserContextProvider>

    )
}
export default App