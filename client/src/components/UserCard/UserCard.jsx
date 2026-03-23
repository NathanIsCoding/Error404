import '../UserCard/UserCard.css'

function UserCard({data: user, onDelete}){ 

    const formatCreatedAt = (createdAt) => {
        if (!createdAt) {
            return 'Unknown';
        }

        const parsedDate = new Date(createdAt);

        if (Number.isNaN(parsedDate.getTime())) {
            return createdAt;
        }

        return parsedDate.toLocaleString();
    };

    return(
        <div className="usercard bg-black text-white items-center grid p-2" 
            style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 2fr 1fr' }}>
            <span className='ml-2'>{user.username}</span>
            <span className='ml-2'>{user.email}</span>
            <span className='ml-2'>{user.rating}</span>
            <label className='flex gap-1 ml-2'>
                <input type='checkbox' checked={user.isAdmin} readOnly />
                Admin
            </label>
            <span className='ml-2'>{formatCreatedAt(user.createdAt)}</span>
            <button className='justify-self-end' onClick={() => onDelete(user.userId)}>Delete</button>
        </div>
    );
}

export default UserCard;