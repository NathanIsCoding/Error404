import '../UserCard/UserCard.css'

function UserCard({user}){ 

    return(
        <div className="usercard bg-black text-white flex justify-between items-center p-2">
            <span className='mr-3'>{user.username}</span>
            <span className='mr-3'>{user.email}</span>
            <span className='mr-3'>{user.rating}</span>
            <label className='mr-3 flex gap-1'>
                <input type='checkbox' checked={user.isAdmin} readOnly />
                Admin
            </label>
            <span className='mr-3'>{user.createdAt}</span>
            <button className='deleteButton'>Delete</button>
        </div>
    )
}

export default UserCard;