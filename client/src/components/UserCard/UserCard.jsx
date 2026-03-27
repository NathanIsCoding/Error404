import '../UserCard/UserCard.css'

function UserCard({data: user, onDelete, onToggle}){ 

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
        <div className="usercard bg-black text-white items-center grid p-3" 
            style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 2fr 0.2fr' }}>
            <span className='ml-2'>{user.username}</span>
            <span className='ml-2'>{user.email}</span>
            <span className='ml-2'>{user.rating}</span>
            <label className='flex gap-1 ml-2'>
                <input type='checkbox' checked={user.isAdmin} readOnly />
                Admin
            </label>
            <button onClick={() => onToggle(user.userId)} className={`!p-1 flex justify-center ${user.isDisabled ? '!bg-green-600' : '!bg-yellow-600'}`}>
                {user.isDisabled ? 'Enable' : 'Disable'}
            </button>
            <span className='ml-2'>{formatCreatedAt(user.createdAt)}</span>
            <button onClick={() => onDelete(user.userId)} className='!bg-red-500 !p-1 flex justify-center'>
                <span className="material-symbols-outlined">close</span>
            </button>
        </div>
    );
}

export default UserCard;