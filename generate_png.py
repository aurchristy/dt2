import zlib
import struct

def create_png(width, height, color_rgb):
    # Pure python PNG generator for solid/gradient square with simple cart shape
    r_val, g_val, b_val = color_rgb
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # filter type none
        for x in range(width):
            # Rounded corners
            corner_radius = width // 5
            dx = max(0, max(corner_radius - x, x - (width - corner_radius)))
            dy = max(0, max(corner_radius - y, y - (height - corner_radius)))
            if dx*dx + dy*dy > corner_radius*corner_radius:
                raw_data.extend([0, 0, 0, 0])
            else:
                # Emerald green gradient
                grad = int(15 * (y / height))
                r = max(0, min(255, r_val - grad))
                g = max(0, min(255, g_val - grad))
                b = max(0, min(255, b_val - grad))
                # Simple white cart emblem in center
                cx = width / 2
                cy = height / 2
                in_emblem = False
                # Cart body box
                if (cx - width*0.25 <= x <= cx + width*0.25 and cy - height*0.15 <= y <= cy + height*0.1) or \
                   (abs(x - (cx - width*0.15)) < width*0.08 and abs(y - (cy + height*0.22)) < height*0.08) or \
                   (abs(x - (cx + width*0.15)) < width*0.08 and abs(y - (cy + height*0.22)) < height*0.08):
                    raw_data.extend([255, 255, 255, 255])
                else:
                    raw_data.extend([r, g, b, 255])

    compressed = zlib.compress(raw_data)
    
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png.extend(struct.pack('>I', len(ihdr_data)))
    png.extend(b'IHDR')
    png.extend(ihdr_data)
    png.extend(struct.pack('>I', ihdr_crc))
    
    # IDAT
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    png.extend(struct.pack('>I', len(compressed)))
    png.extend(b'IDAT')
    png.extend(compressed)
    png.extend(struct.pack('>I', idat_crc))
    
    # IEND
    iend_crc = zlib.crc32(b'IEND')
    png.extend(struct.pack('>I', 0))
    png.extend(b'IEND')
    png.extend(struct.pack('>I', iend_crc))
    
    return png

with open('icon-192.png', 'wb') as f:
    f.write(create_png(192, 192, (5, 150, 105)))

with open('icon-512.png', 'wb') as f:
    f.write(create_png(512, 512, (5, 150, 105)))

print("PNG icons successfully created!")
